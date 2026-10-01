// @ts-nocheck

export default function DoaPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-6">Doa Harian</h1>
      <p className="text-gray-600 mb-8">
        Doa-harian untuk mulai dan mengakhiri hari
      </p>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-medium text-gray-800">Doa Pagi</h2>
            <p className="mt-2 text-gray-600">
              Subhanallah wa bihamdihi, adada syawatirihi, rida nafsihi, wa zin Qidrahihi
            </p>
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-800">Doa Sore</h2>
            <p className="mt-2 text-gray-600">
              Allohumma antas salam, wa minkas salam, tabarakta ya dhal jalali wa ikram
            </p>
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-800">Doa Malam</h2>
            <p className="mt-2 text-gray-600">
              Allohumma qini adhabaka ya ma manna wa manna al-maw'ud
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}