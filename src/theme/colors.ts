// Tema warna hangat ala kopi
export const colors = {
  // Palet kopi
  primary: '#4A2C11', // Coklat gelap kopi tubruk
  primaryLight: '#6F4E37', // Coklat kopi medium
  accent: '#C49A6C', // Coklat susu / karamel
  background: '#FDFBF7', // Krem lembut background
  card: '#FFFFFF', // Putih kartu
  border: '#E8DCCF', // Krem border halus
  
  // Teks
  text: '#2C1D11', // Teks utama coklat sangat pekat
  textMuted: '#7D6A58', // Teks sekunder
  textLight: '#FDFBF7', // Teks terang untuk tombol primary
  
  // Status
  success: '#386641', // Hijau matcha untuk centang selesai
  danger: '#BC4749', // Merah bata untuk hapus
  favorite: '#E76F51', // Oranye coral untuk ikon love/bintang
  star: '#E9C46A', // Kuning mustard untuk favorit bintang
  
  // Netral
  gray: '#CCCCCC',
  inputBg: '#F4ECE1',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};
