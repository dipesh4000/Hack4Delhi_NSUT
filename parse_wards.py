import re
import os

def parse_wards():
    print("Starting parse_wards...")
    try:
        with open('wards.txt', 'r') as f:
            lines = f.readlines()
        print(f"Read {len(lines)} lines.")
    except Exception as e:
        print(f"Error reading wards.txt: {e}")
        return

    wards = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith("Ward No."):
            continue
        
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if match:
            ward_id = match.group(1)
            rest = match.group(2)
            
            zones = [
                "Shahdara South Zone", "Shahdara North Zone", "City S.P.Zone", 
                "Najafgarh Zone", "Central Zone", "South Zone", "West Zone",
                "Civil Line", "Keshavpuram", "Karolbagh", "Rohini", "Narela", "Shahdara"
            ]
            
            ward_name = rest
            ward_zone = "Unknown"
            
            for z in zones:
                if rest.endswith(z):
                    ward_zone = z
                    ward_name = rest[:-len(z)].strip()
                    break
            
            wards.append(f'  {{ id: {ward_id}, name: "{ward_name}", zone: "{ward_zone}" }},')
    
    print(f"Parsed {len(wards)} wards.")

    try:
        os.makedirs('frontend/lib', exist_ok=True)
        with open('frontend/lib/delhi-wards.ts', 'w') as f:
            f.write('export interface Ward {\n')
            f.write('  id: number;\n')
            f.write('  name: string;\n')
            f.write('  zone: string;\n')
            f.write('}\n\n')
            f.write('export const DELHI_WARDS: Ward[] = [\n')
            for w in wards:
                f.write(w + '\n')
            f.write('];\n')
        print("Successfully wrote frontend/lib/delhi-wards.ts")
    except Exception as e:
        print(f"Error writing output file: {e}")

if __name__ == "__main__":
    parse_wards()
