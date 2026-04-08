const PreviewModal = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
      <div className="bg-white p-4 rounded-xl w-[80%] h-[80%]">
        <iframe src={url} className="w-full h-full"></iframe>

        <button onClick={onClose} className="mt-2 text-red-500">
          Close
        </button>
      </div>
    </div>
  )
}

export default PreviewModal