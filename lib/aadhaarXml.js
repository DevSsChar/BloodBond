/** Extract stable identifier from DigiLocker Aadhaar XML (uid or referenceId). */
export function extractAadhaarSubjectKey(xml) {
  if (!xml || typeof xml !== "string") {
    return null;
  }
  const uidAttr = xml.match(/\buid="([^"]+)"/i);
  if (uidAttr?.[1]) {
    return uidAttr[1].replace(/\s/g, "");
  }
  const refAttr = xml.match(/\breferenceId="([^"]+)"/i);
  if (refAttr?.[1]) {
    return refAttr[1].replace(/\s/g, "");
  }
  const uidTag = xml.match(/<(?:Uid|uid)[^>]*>([^<]+)</i);
  if (uidTag?.[1]) {
    return uidTag[1].replace(/\s/g, "");
  }
  return null;
}

export function extractAadhaarName(xml) {
  if (!xml) {
    return null;
  }
  const nameAttr = xml.match(/\bname="([^"]+)"/i);
  if (nameAttr?.[1]) {
    return nameAttr[1].trim();
  }
  const nameTag = xml.match(/<(?:Poi|Poi[^>]*|PrintLetterBarcodeData)[^>]*name="([^"]+)"/i);
  if (nameTag?.[1]) {
    return nameTag[1].trim();
  }
  return null;
}

if (process.env.NODE_ENV !== "production") {
  const sample =
    '<OfflinePaperlessKyc referenceId="abc123" uid="123456789012"><Poi name="Test User"/></OfflinePaperlessKyc>';
  console.assert(
    extractAadhaarSubjectKey(sample) === "123456789012",
    "aadhaarXml: uid extract"
  );
}
