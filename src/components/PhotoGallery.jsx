import { useState, useEffect } from 'react';
import { uploadFile, deleteFile, listFiles, getFileUrl } from '../services/s3Service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const files = await listFiles();
      setPhotos(files.map(file => ({
        key: file.Key,
        url: getFileUrl(file.Key)
      })));
    } catch (error) {
      toast.error('Failed to load photos');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setLoading(true);
    try {
      await uploadFile(file);
      toast.success('Photo uploaded successfully');
      await loadPhotos();
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoKey) => {
    try {
      await deleteFile(photoKey);
      setPhotos(photos.filter(photo => photo.key !== photoKey));
      toast.success('Photo deleted successfully');
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadPhoto(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ToastContainer 
        position="bottom-right" 
        theme="colored" 
        autoClose={3000}
        hideProgressBar
        newestOnTop
      />
      
      {/* Upload Section */}
      <div
        className={`relative border border-dashed rounded-md p-2 mb-3 text-center transition-all duration-200 ease-in-out
          ${dragActive 
            ? 'border-blue-400 bg-blue-50/50' 
            : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex items-center justify-center gap-2">
          <svg 
            className={`w-4 h-4 transition-colors duration-200 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className={`text-xs font-medium ${loading ? 'text-blue-500' : dragActive ? 'text-blue-500' : 'text-gray-500'}`}>
            {loading ? 'Uploading...' : 'Drop photos here or click to upload'}
          </span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {photos.map((photo) => (
            <div 
              key={photo.key} 
              className="group relative aspect-square overflow-hidden rounded-md bg-gray-100"
            >
              <img
                src={photo.url}
                alt="Gallery"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => handleDelete(photo.key)}
                  className="absolute bottom-1.5 right-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs px-1.5 py-0.5 rounded 
                    backdrop-blur-sm transition-all duration-200 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {photos.length === 0 && !loading && (
          <div className="text-center py-4">
            <div className="text-gray-400 text-xs">
              No photos uploaded yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery; 