import connectDB from "@/db/connectDB.mjs";
import { getCompatibleBloodTypes } from "@/lib/bloodCompatibility.js";
import BloodBank from "@/models/BloodBank.js";
import BloodInventory from "@/models/BloodInventory.js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    
    const { latitude, longitude, bloodType } = await req.json();
    
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Location coordinates are required" },
        { status: 400 }
      );
    }

    console.log(`Finding blood banks near: ${latitude}, ${longitude} for blood type: ${bloodType}`);

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // 1. Get blood banks from your database
    const dbBloodBanks = await BloodBank.find({});
    console.log(`Found ${dbBloodBanks.length} blood banks in database`);
    
    // Debug: Log all blood bank names and coordinates
    dbBloodBanks.forEach(bank => {
      console.log(`DB Bank: ${bank.name} at (${bank.latitude}, ${bank.longitude})`);
    });

    // 2. Get real-time blood banks from LocationIQ Places API
    const realTimeBloodBanks = await fetchRealTimeBloodBanks(latitude, longitude);
    console.log(`Found ${realTimeBloodBanks.length} real-time blood banks from LocationIQ`);

    // 3. Combine and process all blood banks
    const allBloodBanks = [
      // Database blood banks with inventory data
      ...await Promise.all(dbBloodBanks.map(async (bank) => {
        let inventory = null;
        let hasRequestedBloodType = false;
        let compatibleInventory = [];
        let hasCompatibleBloodType = false;
        
        if (bloodType) {
          // Get compatible blood types for this request
          const compatibleTypes = getCompatibleBloodTypes(bloodType);
          
          // Check for exact blood type match
          inventory = await BloodInventory.findOne({ 
            bloodbank_id: bank._id, 
            blood_type: bloodType,
            units_available: { $gt: 0 }
          });
          hasRequestedBloodType = !!inventory;
          
          // Check for compatible blood types
          compatibleInventory = await BloodInventory.find({
            bloodbank_id: bank._id,
            blood_type: { $in: compatibleTypes },
            units_available: { $gt: 0 }
          });
          hasCompatibleBloodType = compatibleInventory.length > 0;
        }
        
        return {
          _id: bank._id,
          name: bank.name,
          address: bank.address,
          latitude: bank.latitude,
          longitude: bank.longitude,
          contact_number: bank.contact_number,
          distance: calculateDistance(latitude, longitude, bank.latitude, bank.longitude),
          source: 'database',
          hasRequestedBloodType,
          hasCompatibleBloodType,
          availableUnits: inventory ? inventory.units_available : 0,
          compatibleInventory: compatibleInventory.map(inv => ({
            blood_type: inv.blood_type,
            units_available: inv.units_available,
            isExactMatch: inv.blood_type === bloodType
          })),
          totalCompatibleUnits: compatibleInventory.reduce((sum, inv) => sum + inv.units_available, 0),
          inventory
        };
      })),
      
      // Real-time blood banks from LocationIQ Places
      ...realTimeBloodBanks.map(bank => ({
        _id: `locationiq_${bank.place_id}`,
        name: bank.name,
        address: bank.vicinity || bank.formatted_address,
        latitude: bank.geometry.location.lat,
        longitude: bank.geometry.location.lng,
        contact_number: bank.phone || 'Call for information',
        distance: calculateDistance(latitude, longitude, bank.geometry.location.lat, bank.geometry.location.lng),
        source: 'locationiq',
        hasRequestedBloodType: null, // Unknown for real-time data
        hasCompatibleBloodType: null, // Unknown for real-time data
        availableUnits: null,
        compatibleInventory: [],
        totalCompatibleUnits: null,
        place_id: bank.place_id,
        types: bank.types
      }))
    ];

    // 4. Filter by emergency distance and remove duplicates
    const MAX_EMERGENCY_DISTANCE = 50; // Increased from 25km to include more blood banks
    const uniqueBloodBanks = removeDuplicateBloodBanks(allBloodBanks);
    
    // Debug: Log all blood banks before distance filtering
    console.log('All blood banks before distance filtering:');
    uniqueBloodBanks.forEach(bank => {
      console.log(`${bank.name}: ${bank.distance.toFixed(2)}km (${bank.distance <= MAX_EMERGENCY_DISTANCE ? 'INCLUDED' : 'EXCLUDED'})`);
    });
    
    let filteredBloodBanks = uniqueBloodBanks
      .filter(bank => bank.distance <= MAX_EMERGENCY_DISTANCE)
      .sort((a, b) => {
        // Enhanced priority system:
        // 1. Database banks with exact blood type match (highest priority)
        // 2. Database banks with compatible blood types
        // 3. Database banks without blood type info
        // 4. Real-time banks by distance
        
        const aScore = (a.source === 'database' ? 10 : 3) + 
                      (a.hasRequestedBloodType ? 10 : 0) + 
                      (a.hasCompatibleBloodType && !a.hasRequestedBloodType ? 5 : 0) + 
                      (1 / (a.distance + 1));
        const bScore = (b.source === 'database' ? 10 : 3) + 
                      (b.hasRequestedBloodType ? 10 : 0) + 
                      (b.hasCompatibleBloodType && !b.hasRequestedBloodType ? 5 : 0) + 
                      (1 / (b.distance + 1));
        return bScore - aScore;
      });

    console.log(`After filtering and deduplication: ${filteredBloodBanks.length} blood banks`);

    // 5. If no banks within emergency distance, expand search
    let searchExpanded = false;
    if (filteredBloodBanks.length === 0) {
      console.log('No blood banks within emergency distance, expanding search...');
      filteredBloodBanks = uniqueBloodBanks
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
      searchExpanded = true;
    }

    // 6. Get top recommendations
    const topRecommendations = filteredBloodBanks.slice(0, 5);

    // 7. Use Gemini AI for enhanced recommendations
    const geminiRecommendations = await getGeminiRecommendations(
      topRecommendations,
      bloodType,
      latitude,
      longitude,
      searchExpanded
    );

    return NextResponse.json({
      success: true,
      nearestBloodBanks: topRecommendations,
      recommendations: geminiRecommendations,
      searchExpanded,
      maxDistanceChecked: searchExpanded ? 'unlimited' : `${MAX_EMERGENCY_DISTANCE}km`,
      totalBanksFound: filteredBloodBanks.length,
      databaseBanks: dbBloodBanks.length,
      realTimeBanks: realTimeBloodBanks.length,
      sources: {
        database: topRecommendations.filter(b => b.source === 'database').length,
        google_places: topRecommendations.filter(b => b.source === 'google_places').length
      }
    });

  } catch (error) {
    console.error("Error finding nearby blood banks:", error);
    return NextResponse.json(
      { error: "Failed to find nearby blood banks", details: error.message },
      { status: 500 }
    );
  }
}

// Fetch real-time blood banks from LocationIQ Places API
async function fetchRealTimeBloodBanks(latitude, longitude) {
  try {
    const radius = 25000; // 25km radius in meters
    const searchTerms = [
      'blood bank',
      'blood donation center',
      'blood transfusion center',
      'red cross blood center',
      'hospital blood bank'
    ];

    const allResults = [];

    for (const searchTerm of searchTerms) {
      try {
        // LocationIQ Places API - Nearby Search
        const url = `https://api.locationiq.com/v1/nearby.php?key=${process.env.LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&tag=amenity:hospital&radius=${radius}&format=json`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Filter results that might be blood banks based on name
          const bloodBankResults = data.filter(place => {
            const name = place.display_name || place.name || '';
            return name.toLowerCase().includes('blood') || 
                   name.toLowerCase().includes('donation') ||
                   name.toLowerCase().includes('transfusion') ||
                   name.toLowerCase().includes('red cross');
          });
          
          allResults.push(...bloodBankResults);
        }

        // Also try a direct search for blood banks
        const searchUrl = `https://api.locationiq.com/v1/search.php?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(searchTerm)}&format=json&limit=10&bounded=1&viewbox=${longitude-0.2},${latitude+0.2},${longitude+0.2},${latitude-0.2}`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (Array.isArray(searchData)) {
          allResults.push(...searchData);
        }

      } catch (termError) {
        console.error(`Error searching LocationIQ for "${searchTerm}":`, termError.message);
      }
    }

    // Remove duplicates based on coordinates or display_name
    const uniqueResults = allResults.filter((place, index, self) => 
      index === self.findIndex(p => 
        (Math.abs(parseFloat(p.lat) - parseFloat(place.lat)) < 0.001 && 
         Math.abs(parseFloat(p.lon) - parseFloat(place.lon)) < 0.001) ||
        p.display_name === place.display_name
      )
    );

    // Convert LocationIQ format to our standard format
    const standardizedResults = uniqueResults.map(place => ({
      place_id: place.place_id || `locationiq_${place.lat}_${place.lon}`,
      name: extractLocationName(place.display_name || place.name),
      vicinity: place.display_name,
      formatted_address: place.display_name,
      geometry: {
        location: {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        }
      },
      types: place.type ? [place.type] : ['hospital'],
      phone: null, // LocationIQ doesn't provide phone numbers in basic search
      source_api: 'locationiq'
    }));

    console.log(`LocationIQ API found ${standardizedResults.length} unique blood-related facilities`);
    return standardizedResults;

  } catch (error) {
    console.error("LocationIQ Places API error:", error);
    return []; // Return empty array if LocationIQ API fails
  }
}

// Helper function to extract a clean name from LocationIQ's display_name
function extractLocationName(displayName) {
  if (!displayName) return 'Unknown Location';
  
  // LocationIQ returns format like "Name, Street, City, State, Country"
  // Try to extract the first meaningful part
  const parts = displayName.split(',');
  let name = parts[0].trim();
  
  // If the first part is just a number or very short, try the second part
  if (name.length < 3 || /^\d+$/.test(name)) {
    name = parts[1] ? parts[1].trim() : name;
  }
  
  return name;
}

// Remove duplicate blood banks (same name and similar location)
function removeDuplicateBloodBanks(banks) {
  const unique = [];
  
  for (const bank of banks) {
    const isDuplicate = unique.some(existing => {
      const nameSimilar = bank.name.toLowerCase().includes(existing.name.toLowerCase()) || 
                         existing.name.toLowerCase().includes(bank.name.toLowerCase());
      const locationSimilar = Math.abs(bank.latitude - existing.latitude) < 0.001 && 
                             Math.abs(bank.longitude - existing.longitude) < 0.001;
      return nameSimilar && locationSimilar;
    });
    
    if (!isDuplicate) {
      unique.push(bank);
    }
  }
  
  return unique;
}

async function getGeminiRecommendations(bloodBanks, bloodType, userLat, userLon, searchExpanded) {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    You are a medical emergency assistant helping someone find the best blood bank for an URGENT emergency blood request.
    
    User Location: Latitude ${userLat}, Longitude ${userLon}
    Required Blood Type: ${bloodType || "Not specified"}
    ${searchExpanded ? 'WARNING: Search was expanded beyond normal emergency distance due to limited nearby options.' : ''}
    
    Available Blood Banks (REAL-TIME + DATABASE):
    ${bloodBanks.map((bank, index) => `
    ${index + 1}. ${bank.name} ${bank.source === 'database' ? '🏦 [DATABASE]' : '🌐 [REAL-TIME]'}
       - Address: ${bank.address}
       - Distance: ${bank.distance.toFixed(1)} km ${bank.distance > 20 ? '⚠️ FAR' : bank.distance <= 10 ? '✅ NEAR' : '🟡 MODERATE'}
       - Contact: ${bank.contact_number}
       ${bank.source === 'database' ? 
         `- Has ${bloodType} blood: ${bank.hasRequestedBloodType ? `✅ YES (${bank.availableUnits} units)` : '❌ NO'}` :
         '- Blood availability: ❓ Call to confirm'
       }
       ${bank.rating ? `- Google Rating: ${bank.rating}/5` : ''}
       - Emergency Priority: ${
         bank.source === 'database' && bank.hasRequestedBloodType && bank.distance <= 10 ? 'HIGHEST' :
         bank.distance <= 10 ? 'HIGH' : 
         bank.distance <= 20 ? 'MEDIUM' : 'LOW'
       }
    `).join('\n')}
    
    EMERGENCY RECOMMENDATIONS:
    1. Rank these blood banks for EMERGENCY use (prioritize: DATABASE banks with confirmed blood > DATABASE banks > REAL-TIME banks by distance)
    2. Note which are from your trusted database vs real-time Google data
    3. For real-time banks, emphasize the need to call and confirm blood availability
    4. Provide specific action steps for each bank
    5. Keep response concise but actionable for life-threatening situations
    
    Format as a clear emergency action plan with step-by-step instructions.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return `Unable to get AI recommendations at this time. 
    
EMERGENCY ACTION PLAN:
1. 🏦 DATABASE BANKS (Confirmed): ${bloodBanks.filter(b => b.source === 'database').map(b => `${b.name} (${b.distance.toFixed(1)}km) - ${b.contact_number}`).join(', ')}
2. 🌐 REAL-TIME BANKS (Call to confirm): ${bloodBanks.filter(b => b.source === 'google_places').map(b => `${b.name} (${b.distance.toFixed(1)}km)`).join(', ')}
3. For immediate help, call emergency services: 108
4. Contact multiple banks simultaneously to save time.`;
  }
}
