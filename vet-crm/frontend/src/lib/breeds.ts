export const DOG_BREEDS = [
  "Mixed Breed",
  "French Bulldog",
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd Dog",
  "Poodle",
  "Bulldog",
  "Rottweiler",
  "Beagle",
  "Dachshund",
  "German Shorthaired Pointer",
  "Pembroke Welsh Corgi",
  "Australian Shepherd",
  "Yorkshire Terrier",
  "Cavalier King Charles Spaniel",
  "Doberman Pinscher",
  "Boxer",
  "Miniature Schnauzer",
  "Cane Corso",
  "Great Dane",
  "Shih Tzu",
  "Siberian Husky",
  "Bernese Mountain Dog",
  "Pomeranian",
  "Boston Terrier",
  "Havanese",
  "English Springer Spaniel",
  "Shetland Sheepdog",
  "Brittany",
  "Pug",
  "Cocker Spaniel",
  "Miniature American Shepherd",
  "Border Collie",
  "Mastiff",
  "Chihuahua",
  "Vizsla",
  "Basset Hound",
  "Belgian Malinois",
  "Maltese",
  "Weimaraner",
  "Collie",
  "Newfoundland",
  "Rhodesian Ridgeback",
  "Shiba Inu",
  "Bloodhound",
  "Akita",
  "Portuguese Water Dog",
  "Bichon Frise",
  "Bullmastiff",
  "English Cocker Spaniel",
  "Papillon",
  "Dalmatian",
  "Other"
];

export const CAT_BREEDS = [
  "Domestic Shorthair (Mixed)",
  "Domestic Mediumhair (Mixed)",
  "Domestic Longhair (Mixed)",
  "Maine Coon",
  "Ragdoll",
  "Persian",
  "Exotic Shorthair",
  "British Shorthair",
  "Abyssinian",
  "Scottish Fold",
  "Sphynx",
  "Devon Rex",
  "American Shorthair",
  "Cornish Rex",
  "Bengal",
  "Russian Blue",
  "Siberian",
  "Norwegian Forest Cat",
  "Siamese",
  "Burmese",
  "Birman",
  "Tonkinese",
  "Himalayan",
  "Other"
];

export const BIRD_BREEDS = [
  "Parrot / Macaw",
  "Parakeet / Budgie",
  "Cockatiel",
  "Canary / Finch",
  "Cockatoo",
  "Lovebird",
  "Other"
];

export const REPTILE_BREEDS = [
  "Snake",
  "Lizard / Gecko / Iguana",
  "Turtle / Tortoise",
  "Amphibian",
  "Other"
];

export const OTHER_BREEDS = [
  "Not Applicable",
  "Rabbit",
  "Ferret",
  "Guinea Pig",
  "Hamster",
  "Gerbil",
  "Mouse",
  "Rat",
  "Chinchilla",
  "Hedgehog",
  "Other"
];

export const getBreedsForSpecies = (species: string) => {
  if (species === 'Dog') return DOG_BREEDS;
  if (species === 'Cat') return CAT_BREEDS;
  if (species === 'Bird') return BIRD_BREEDS;
  if (species === 'Reptile') return REPTILE_BREEDS;
  return OTHER_BREEDS;
};
