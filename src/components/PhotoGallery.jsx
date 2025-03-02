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
    <div className="w-full flex flex-col space-y-2">
      <ToastContainer 
        position="bottom-right" 
        theme="colored" 
        autoClose={3000}
        hideProgressBar
        newestOnTop
      />
      
      {/* Upload Section */}
      <div
        className={`w-[80%] relative border border-dashed rounded-sm p-0.5 text-center transition-all duration-200 ease-in-out
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
        <div className="flex items-center justify-center h-full gap-1">
          <svg 
            className={`w-3 h-3 transition-colors duration-200 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className={`text-[11px] ${loading ? 'text-blue-500' : dragActive ? 'text-blue-500' : 'text-gray-500'}`}>
            {loading ? 'Uploading...' : 'Add photo'}
          </span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {photos.map((photo) => (
            <div 
              key={photo.key} 
              className="relative w-[150px] h-[150px] overflow-hidden rounded-sm bg-gray-100"
            >
              <img
                src={photo.url}
                alt="Gallery"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div 
                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
              >
                <button
                  onClick={() => handleDelete(photo.key)}
                  className="bg-red-500/90 hover:bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {photos.length === 0 && !loading && (
          <div className="text-center py-2">
            <div className="text-gray-400 text-[11px]">
              No photos uploaded yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery; 