export default function ImageGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Image items will be mapped here */}
      <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
        <span className="text-gray-500">No images</span>
      </div>
    </div>
  )
}
