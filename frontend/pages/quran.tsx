export default function QuranPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-purple-600 mb-6">Al-Qur'an Digital</h1>
      <p className="text-gray-600 mb-8">
        Bacaan dan terjemahan Qur'an dalam berbagai bahasa
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Surah cards will be rendered here */}
      </div>
    </div>
  )
}