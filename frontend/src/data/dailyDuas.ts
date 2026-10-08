export interface DailyDua {
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source?: string;
}

export const dailyDuas: DailyDua[] = [
  {
    title: 'Doa bangun tidur',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdu lillahil-ladzi ahyana ba’da ma amatana wa ilaihin-nusyur.',
    translation: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.',
    source: 'HR. Al-Bukhari',
  },
  {
    title: 'Doa sebelum makan',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah.',
    translation: 'Dengan nama Allah.',
    source: 'HR. Abu Dawud dan At-Tirmidzi',
  },
  {
    title: 'Doa setelah makan',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: 'Alhamdu lillahil-ladzi ath’amani hadza wa razaqanihi min ghairi haulin minni wa la quwwah.',
    translation: 'Segala puji bagi Allah yang telah memberiku makanan ini dan menganugerahkannya kepadaku tanpa daya dan kekuatan dariku.',
    source: 'HR. Abu Dawud dan At-Tirmidzi',
  },
  {
    title: 'Doa masuk rumah',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    transliteration: 'Bismillahi walajna, wa bismillahi kharajna, wa ‘alallahi rabbina tawakkalna.',
    translation: 'Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah, Tuhan kami, kami bertawakal.',
    source: 'HR. Abu Dawud',
  },
  {
    title: 'Doa sebelum tidur',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya.',
    translation: 'Dengan nama-Mu, ya Allah, aku mati dan aku hidup.',
    source: 'HR. Al-Bukhari',
  },
];
