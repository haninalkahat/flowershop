import json

file_path = 'messages/ar.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update FlowerTypes for AR
data['FlowerTypes']['sunflower'] = "عباد الشمس"
data['FlowerTypes']['peony'] = "عود"
data['FlowerTypes']['lily of the valley'] = "زهرة الوادي"

# Ensure all requested types are present (just in case)
data['FlowerTypes']['orchid'] = "أوركيد"
data['FlowerTypes']['tulip'] = "توليب"
data['FlowerTypes']['rose'] = "ورد"
data['FlowerTypes']['mixed'] = "مختلط"
data['FlowerTypes']['lily'] = "زنبق"
data['FlowerTypes']['hydrangea'] = "هيدرانجيا"
data['FlowerTypes']['carnation'] = "قرنفل"
data['FlowerTypes']['pampas'] = "بامبز"
data['FlowerTypes']['calla lily'] = "زنبق الكالا"
data['FlowerTypes']['daffodil'] = "نرجس"

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("Successfully updated ar.json")
