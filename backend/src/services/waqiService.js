const WAQI_TOKEN = process.env.WAQI_TOKEN;

async function fetchWAQIData(lat, lon, keyword) {
  if (!WAQI_TOKEN) {
    console.error("WAQI Token missing in backend");
    return null;
  }

  try {
    let feedUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`;

    // Hackathon specific mappings
    const FALLBACK_MAPPINGS = {
      "Najafgarh": "Dwarka",
      "Mundka": "Dwarka",
      "Nangloi": "Dwarka",
      "Uttam Nagar": "Dwarka"
    };

    if (keyword) {
        let cleanKeyword = keyword.split(",")[0].replace(/Sector\s?\d+/i, "").trim();
        
        if (FALLBACK_MAPPINGS[cleanKeyword]) {
          console.log(`Applying fallback mapping: ${cleanKeyword} -> ${FALLBACK_MAPPINGS[cleanKeyword]}`);
          cleanKeyword = FALLBACK_MAPPINGS[cleanKeyword];
        }

        if (cleanKeyword.length > 3) {
             const searchRes = await fetch(`https://api.waqi.info/search/?token=${WAQI_TOKEN}&keyword=${cleanKeyword}`);
             const searchData = await searchRes.json();
             if (searchData.status === "ok" && searchData.data.length > 0) {
                 const bestStation = searchData.data.find((s) => s.station.name.includes("Sector 8")) || searchData.data[0];
                 feedUrl = `https://api.waqi.info/feed/@${bestStation.uid}/?token=${WAQI_TOKEN}`;
                 console.log(`Found specific station for ${cleanKeyword}:`, bestStation.station.name);
             }
        }
    }

    const res = await fetch(feedUrl);
    const data = await res.json();

    if (data.status !== "ok") {
      console.error("WAQI API Error:", data.data);
      return null;
    }

    return data.data;

  } catch (err) {
    console.error("Failed to fetch WAQI data", err);
    return null;
  }
}

module.exports = { fetchWAQIData };
