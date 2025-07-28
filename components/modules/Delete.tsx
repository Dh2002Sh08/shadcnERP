// // components/DeleteFormModal.tsx
// import React from 'react';

// interface DeleteFormModalProps {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
// }

// export const DeleteFormModal: React.FC<DeleteFormModalProps> = ({ open, onClose, onConfirm }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
//       <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
//         <p className="text-gray-700 mb-6">Are you sure you want to delete your account? This action is permanent and cannot be undone.</p>
//         <div className="flex justify-end space-x-4">
//           <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
//           <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md">Delete</button>
//         </div>
//       </div>
//     </div>
//   );
// };
