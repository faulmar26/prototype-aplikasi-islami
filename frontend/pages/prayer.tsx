export default function PrayerPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Jadwal Shalat</h1>
      <p className="text-gray-600 mb-8">
        Cari jadwal shalat berdasarkan lokasi Anda
      </p>
      <div className="bg-white rounded-lg p-6 shadow-md max-w-md">
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kota
            </label>
            <input 
              type="text" 
              placeholder="Masukkan kota/kordinat"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white font-medium rounded-lg py-2.5 px-5 hover:bg-indigo-700 transition-colors duration-200">
            Cari Waktu
          </button>
        </form>
      </div>
    </div>
  )
}