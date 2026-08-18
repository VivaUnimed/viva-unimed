const PROFILE_STORAGE_KEY = "vivaunimed-profile";

const defaultProfile = {
  name: "Mariana Silva Oliveira",
  email: "mariana.silva@email.com.br",
  phone: "(47) 99876-5432",
  cpf: "000.000.000-00",
  birthDate: "24/08/1985",
};

export function getProfileData(user = {}) {
  let savedProfile = {};

  try {
    savedProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || {};
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }

  return {
    ...defaultProfile,
    name: user?.name || defaultProfile.name,
    email: user?.email || defaultProfile.email,
    ...savedProfile,
  };
}

export function saveProfileData(profileData) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
}
