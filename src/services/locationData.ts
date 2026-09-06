export interface Wilaya {
  id: string;
  name: string;
  communes: string[];
}

// A representative list of Algerian Wilayas and their Communes for Phase 2.
// In a production environment, this should be a complete list or fetched from a dedicated API.
export const algerianLocations: Wilaya[] = [
  {
    id: "01",
    name: "Adrar",
    communes: ["Adrar", "Tamest", "Charouine", "Reggane", "In Zghmir", "Tit", "Tsabit", "Timimoun", "Ouled Saïd", "Zaouiet Kounta"],
  },
  {
    id: "02",
    name: "Chlef",
    communes: ["Chlef", "Ténès", "Boukadir", "Ouled Farès", "Oued Fodda", "Sendjas", "Sidi Abderrahmane", "Moussek", "Harchoun", "Oued Sly"],
  },
  {
    id: "06",
    name: "Béjaïa",
    communes: ["Béjaïa", "Amizour", "Sidi Aïch", "Akbou", "El Kseur", "Oued Ghir", "Tichy", "Aokas", "Souk El Tenine", "Melbou"],
  },
  {
    id: "09",
    name: "Blida",
    communes: ["Blida", "Boufarik", "Beni Mered", "Ouled Yaïch", "Chréa", "El Affroun", "Wadi El Alleug", "Mouzaïa", "Meftah", "Larbaâ"],
  },
  {
    id: "16",
    name: "Algiers",
    communes: ["Algiers Center", "Sidi M'Hamed", "El Madania", "Belouizdad", "Bab El Oued", "Bologhine", "Casbah", "Oued Koriche", "Bir Mourad Raïs", "Birmandreis", "Hydra", "El Biar", "Kouba", "Bachedjerah", "Dar El Beïda", "Bab Ezzouar", "Bordj El Kiffan", "Bordj El Bahri", "El Marsa", "Rouïba", "Reghaïa", "Aïn Taya", "Zeralda", "Staoueli", "Cheraga", "Dely Ibrahim", "Hammamet"],
  },
  {
    id: "19",
    name: "Sétif",
    communes: ["Sétif", "Aïn El Kebira", "Beni Aziz", "Amoucha", "Babor", "Aïn Abessa", "El Ouricia", "Bouandas", "Aït Naoual Mezada", "Aït Tizi"],
  },
  {
    id: "25",
    name: "Constantine",
    communes: ["Constantine", "Hamma Bouziane", "Didouche Mourad", "Zighoud Youcef", "Khroub", "Aïn Abid", "Ben Badis", "Ibn Ziad", "Messaoud Boudjriou", "Ouled Rahmouni"],
  },
  {
    id: "31",
    name: "Oran",
    communes: ["Oran", "Gdyel", "Bir El Djir", "Hassi Bounif", "Es Sénia", "Arzew", "Bethioua", "Marsat El Hadjadj", "Aïn El Turk", "Bousfer", "El Ançor", "Oued Tlelat"],
  },
  {
    id: "35",
    name: "Boumerdès",
    communes: ["Boumerdès", "Boudouaou", "Afir", "Bordj Menaïel", "Baghlia", "Sidi Daoud", "Naciria", "Isser", "Zemmouri", "Thenia"],
  },
  {
    id: "42",
    name: "Tipaza",
    communes: ["Tipaza", "Menaceur", "Larhat", "Douaouda", "Bourkika", "Khemisti", "Aghbal", "Hadjout", "Sidi Amar", "Gouraya"],
  },
];

export const getWilayas = () => algerianLocations.map(({ id, name }) => ({ id, name }));

export const getCommunes = (wilayaName: string) => {
  const wilaya = algerianLocations.find((w) => w.name === wilayaName);
  return wilaya ? wilaya.communes : [];
};

export const isValidLocation = (wilayaName: string, communeName: string) => {
  const wilaya = algerianLocations.find((w) => w.name === wilayaName);
  if (!wilaya) return false;
  return wilaya.communes.includes(communeName);
};
