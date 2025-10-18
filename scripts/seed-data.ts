import { drizzle } from "drizzle-orm/mysql2";
import { deviceModels, errorCodes, parts, suppliers, supplierLocations, inventorySnapshots } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seedData() {
  console.log("Seeding database...");

  // Seed device models
  console.log("Adding device models...");
  const modelResults = await db.insert(deviceModels).values([
    {
      brand: "Carrier",
      modelNumber: "58MCA080",
      equipmentType: "furnace",
      specs: { efficiency: "80% AFUE", btu: 80000 },
    },
    {
      brand: "Mitsubishi",
      modelNumber: "MSZ-GL12NA",
      equipmentType: "mini_split",
      specs: { seer: 23, btu: 12000, type: "wall-mounted" },
    },
    {
      brand: "Goodman",
      modelNumber: "GMEC960603BN",
      equipmentType: "furnace",
      specs: { efficiency: "96% AFUE", btu: 60000 },
    },
    {
      brand: "Trane",
      modelNumber: "XR14",
      equipmentType: "air_conditioner",
      specs: { seer: 14.5, btu: 36000 },
    },
    {
      brand: "Lennox",
      modelNumber: "EL296V",
      equipmentType: "furnace",
      specs: { efficiency: "96% AFUE", btu: 80000 },
    },
  ]);

  // Seed error codes
  console.log("Adding error codes...");
  await db.insert(errorCodes).values([
    {
      modelId: 1,
      code: "E3",
      description: "Pressure switch error - furnace not detecting proper airflow",
      likelyCauses: ["Blocked air filter", "Pressure switch failure", "Blocked flue"],
      severity: "high",
      safetyGate: "gas",
    },
    {
      modelId: 2,
      code: "E7",
      description: "Communication error between indoor and outdoor units",
      likelyCauses: ["Wiring issue", "Control board failure", "Power supply problem"],
      severity: "medium",
    },
    {
      modelId: 3,
      code: "F02",
      description: "Ignition failure - furnace unable to light",
      likelyCauses: ["Faulty ignitor", "Gas valve issue", "Flame sensor dirty"],
      severity: "critical",
      safetyGate: "gas",
    },
  ]);

  // Seed parts
  console.log("Adding parts...");
  const partResults = await db.insert(parts).values([
    {
      oemPartNo: "CAP-35/5",
      mfr: "Generic",
      description: "Dual Run Capacitor 35/5 µF 370V",
      equipmentTypes: ["air_conditioner", "heat_pump"],
      specs: { voltage: 370, capacitance: "35/5 µF" },
    },
    {
      oemPartNo: "TH8321WF1001",
      mfr: "Honeywell",
      description: "VisionPRO WiFi Thermostat 7-Day Programmable",
      equipmentTypes: ["furnace", "air_conditioner", "heat_pump"],
      specs: { type: "programmable", connectivity: "wifi" },
    },
    {
      oemPartNo: "IG-001",
      mfr: "Universal",
      description: "Hot Surface Ignitor for Gas Furnaces",
      equipmentTypes: ["furnace"],
      specs: { voltage: 120, type: "silicon carbide" },
    },
    {
      oemPartNo: "C230B",
      mfr: "Honeywell",
      description: "Fan and Limit Control",
      equipmentTypes: ["furnace"],
      specs: { voltage: 120 },
    },
    {
      oemPartNo: "PSW-001",
      mfr: "Generic",
      description: "Pressure Switch for Furnace",
      equipmentTypes: ["furnace"],
      specs: { type: "SPST" },
    },
  ]);

  // Seed suppliers
  console.log("Adding suppliers...");
  const supplierResults = await db.insert(suppliers).values([
    {
      name: "Ferguson HVAC",
      chain: "Ferguson",
      contact: { phone: "555-0100", website: "ferguson.com" },
    },
    {
      name: "Johnstone Supply",
      chain: "Johnstone",
      contact: { phone: "555-0200", website: "johnstonesupply.com" },
    },
    {
      name: "United Refrigeration",
      chain: "United",
      contact: { phone: "555-0300", website: "uri.com" },
    },
  ]);

  // Seed supplier locations
  console.log("Adding supplier locations...");
  await db.insert(supplierLocations).values([
    {
      supplierId: 1,
      name: "Ferguson HVAC - Downtown",
      address: "123 Main St, Anytown, ST 12345",
      city: "Anytown",
      state: "ST",
      zipCode: "12345",
      lat: "40.7128",
      lng: "-74.0060",
      phone: "555-0101",
      hours: { mon_fri: "7:00 AM - 5:00 PM", sat: "8:00 AM - 12:00 PM" },
    },
    {
      supplierId: 2,
      name: "Johnstone Supply - North Branch",
      address: "456 Oak Ave, Anytown, ST 12346",
      city: "Anytown",
      state: "ST",
      zipCode: "12346",
      lat: "40.7580",
      lng: "-73.9855",
      phone: "555-0201",
      hours: { mon_fri: "7:00 AM - 6:00 PM", sat: "8:00 AM - 2:00 PM" },
    },
    {
      supplierId: 3,
      name: "United Refrigeration - South",
      address: "789 Pine Rd, Anytown, ST 12347",
      city: "Anytown",
      state: "ST",
      zipCode: "12347",
      lat: "40.6892",
      lng: "-74.0445",
      phone: "555-0301",
      hours: { mon_fri: "6:30 AM - 5:00 PM", sat: "Closed" },
    },
  ]);

  // Seed inventory snapshots
  console.log("Adding inventory data...");
  await db.insert(inventorySnapshots).values([
    {
      partId: 1,
      supplierLocationId: 1,
      stockLevel: 15,
      priceCents: 1899,
      stockStatus: "in_stock",
    },
    {
      partId: 1,
      supplierLocationId: 2,
      stockLevel: 8,
      priceCents: 1799,
      stockStatus: "in_stock",
    },
    {
      partId: 2,
      supplierLocationId: 1,
      stockLevel: 3,
      priceCents: 12999,
      stockStatus: "low_stock",
    },
    {
      partId: 2,
      supplierLocationId: 2,
      stockLevel: 12,
      priceCents: 12499,
      stockStatus: "in_stock",
    },
    {
      partId: 3,
      supplierLocationId: 1,
      stockLevel: 25,
      priceCents: 2499,
      stockStatus: "in_stock",
    },
    {
      partId: 3,
      supplierLocationId: 3,
      stockLevel: 18,
      priceCents: 2399,
      stockStatus: "in_stock",
    },
  ]);

  console.log("✅ Database seeded successfully!");
}

seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });

