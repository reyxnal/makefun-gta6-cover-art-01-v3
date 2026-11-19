// Neon grade presets for the cover renderer. Each grade is a small recipe:
// a sky-tint wash, a warm low-light wash, the neon accent pair used for the
// frame glow and the chrome title, and how hard the grade pushes saturation.
export const GRADES = {
  neon: {
    label: 'Neon Nights',
    skyTop: '#2b0a4d',
    skyBottom: '#ff2e88',
    wash: 'rgba(255, 46, 136, 0.16)',
    deep: 'rgba(34, 230, 255, 0.20)',
    accentA: '#22e6ff',
    accentB: '#ff2e88',
    frame: '#ff2e88',
    saturate: 1.35,
    contrast: 1.08,
    brightness: 1.02,
  },
  sunset: {
    label: 'Sunset Vice',
    skyTop: '#3a1160',
    skyBottom: '#ff7a1a',
    wash: 'rgba(255, 122, 26, 0.20)',
    deep: 'rgba(122, 40, 180, 0.22)',
    accentA: '#ffb02e',
    accentB: '#ff4d6d',
    frame: '#ffb02e',
    saturate: 1.3,
    contrast: 1.06,
    brightness: 1.04,
  },
  noir: {
    label: 'Palm Noir',
    skyTop: '#04141c',
    skyBottom: '#0e5f6b',
    wash: 'rgba(20, 180, 190, 0.14)',
    deep: 'rgba(2, 20, 28, 0.30)',
    accentA: '#4de8d2',
    accentB: '#e8f6ff',
    frame: '#4de8d2',
    saturate: 1.12,
    contrast: 1.14,
    brightness: 0.97,
  },
  dawn: {
    label: 'Pastel Dawn',
    skyTop: '#5b2a6e',
    skyBottom: '#ffb59e',
    wash: 'rgba(255, 150, 180, 0.16)',
    deep: 'rgba(255, 214, 170, 0.14)',
    accentA: '#ffd6a5',
    accentB: '#ff8fb3',
    frame: '#ff8fb3',
    saturate: 1.22,
    contrast: 1.02,
    brightness: 1.06,
  },
};

export const GRADE_IDS = Object.keys(GRADES);

export function gradeById(id) {
  return GRADES[id] || GRADES.neon;
}

export function gradeLabel(id) {
  return gradeById(id).label;
}
