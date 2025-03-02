import PhotoGallery from './components/PhotoGallery'

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              Photo Gallery
            </h1>
            <div className="text-xs text-gray-400">
              AWS S3
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden max-w-6xl w-full mx-auto px-3 py-3">
        <div className="h-full bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <PhotoGallery />
        </div>
      </main>
    </div>
  )
}

export default App
