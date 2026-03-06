export function getCategoryObjectRules(category: string): { allowed: string[]; avoid: string[] } {
  const normalized = category.toLowerCase();

  if (normalized === "bathroom") {
    return {
      allowed: ["toilet", "wash basin / vanity", "mirror", "shower area or bathtub", "towel fixtures", "small bathroom storage"],
      avoid: ["sofa", "tv unit", "dining table", "bed", "wardrobe", "kitchen island"],
    };
  }

  if (normalized.includes("kitchen")) {
    return {
      allowed: ["base and wall cabinets", "countertop", "sink", "hob/cooktop", "chimney/hood", "fridge", "compact dining nook if space allows"],
      avoid: ["bed", "large sofa set", "bathtub", "wardrobe"],
    };
  }

  if (normalized.includes("bedroom")) {
    return {
      allowed: ["bed", "side tables", "wardrobe", "dresser", "study table if space allows", "accent chair"],
      avoid: ["kitchen appliances", "toilet fixtures", "dining table set for 6+"],
    };
  }

  if (normalized.includes("living room") || normalized.includes("hall")) {
    return {
      allowed: ["sofa set", "center table", "tv/media unit", "accent chair", "console / decor shelving", "rug"],
      avoid: ["toilet fixtures", "kitchen stove", "bed as primary object"],
    };
  }

  return {
    allowed: ["category-appropriate furniture and fixtures based on space function"],
    avoid: ["objects that conflict with the selected category function"],
  };
}

export function itemExplicitlyRequestedByUser(item: string, userPrompt: string): boolean {
  const prompt = userPrompt.toLowerCase();
  const itemKey = item.toLowerCase();

  const keywordMap: Record<string, string[]> = {
    sofa: ["sofa", "couch", "sectional", "loveseat"],
    "tv unit": ["tv unit", "television unit", "media unit", "entertainment unit"],
    "dining table": ["dining table", "dining set", "dining area", "eat-in table"],
    bed: ["bed", "cot", "queen bed", "king bed", "bunk bed"],
    wardrobe: ["wardrobe", "closet", "almirah"],
    bathtub: ["bathtub", "bath tub", "tub"],
    "toilet fixtures": ["toilet", "wc", "commode", "wash basin", "vanity"],
    "kitchen island": ["kitchen island", "island counter"],
    "kitchen appliances": ["kitchen appliance", "oven", "microwave", "cooktop", "hob", "chimney", "hood"],
  };

  const matchedKeywordSet = Object.entries(keywordMap).find(([key]) => itemKey.includes(key));
  const keywords = matchedKeywordSet ? matchedKeywordSet[1] : [itemKey];
  return keywords.some((keyword) => prompt.includes(keyword));
}
