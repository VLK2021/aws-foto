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
    <div className="container mx-auto p-4 space-y-8">
      <ToastContainer position="bottom-right" theme="colored" />
      
      {/* Upload Section */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
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
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg 
              className={`w-12 h-12 transition-colors duration-300 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
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
          </div>
          <div className="text-lg">
            {loading ? (
              <span className="text-blue-500">Uploading...</span>
            ) : (
              <span className={dragActive ? 'text-blue-500' : 'text-gray-600'}>
                Drag and drop your photos here or click to select
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div 
            key={photo.key} 
            className="group relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="aspect-w-1 aspect-h-1">
              <img
                src={photo.url}
                alt="Gallery"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleDelete(photo.key)}
                className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {photos.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            No photos uploaded yet. Start by uploading your first photo!
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery; 