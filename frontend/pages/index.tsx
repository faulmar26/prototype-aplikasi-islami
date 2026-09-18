export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-8">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">
        Aplikasi Islami
      </h1>
      <p className="text-lg text-gray-600">
        Platform integratif untuk jadwal shalat, Qur'an, doa, dan gamifikasi ibadah
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <a href="/prayer" className="group bg-indigo-600 text-white rounded-lg px-6 py-3 hover:bg-indigo-700 transition-colors duration-200">
          <span className="iconify" data-icon="mdi:prayer" style="color: white;"></span>
          <h3 className="mt-2">Jadwal Shalat</h3>
        </a>
        <a href="/quran" className="group bg-purple-600 text-white rounded-lg px-6 py-3 hover:bg-purple-700 transition-colors duration-200">
          <span className="iconify" data-icon="mdi:quran" style="color: white;"></span>
          <h3 className="mt-2">Al-Qur'an</h3>
        </a>
        <a href="/doa" className="group bg-green-600 text-white rounded-lg px-6 py-3 hover:bg-green-700 transition-colors duration-200">
          <span className="iconify" data-icon="mdi:pray" style="color: white;"></span>
          <h3 className="mt-2">Doa Harian</h3>
        </a>
      </div>
    </div>
  )
}