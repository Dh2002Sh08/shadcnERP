// import React, { useState } from 'react';
// import { Modal } from '../common/Modal';
// import { dbService } from '../../lib/supabase';

// interface DeleteFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   userId: string;
//   userName?: string;
// }

// export const DeleteForm: React.FC<DeleteFormProps> = ({
//   isOpen,
//   onClose,
//   onSuccess,
//   userId,
//   userName,
// }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [confirmationText, setConfirmationText] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate confirmation text
//     if (confirmationText !== 'DELETE') {
//       setError('Please type "DELETE" to confirm');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const result = await dbService.deleteAccount(userId);
      
//       if (!result.success) {
//         throw new Error(result.message || 'Failed to delete account');
//       }

//       onSuccess();
//       onClose();
//     } catch (error) {
//       console.error('Error deleting account:', error);
//       setError(error instanceof Error ? error.message : 'An error occurred while deleting the account');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setConfirmationText(e.target.value);
//     setError(null);
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Delete Account"
//       size="md"
//     >
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="text-center">
//           <p className="text-lg text-gray-700 mb-4">
//             Are you sure you want to delete {userName ? `the account for ${userName}` : 'this account'}?
//             This action cannot be undone.
//           </p>
//           <p className="text-sm text-red-600 mb-4">
//             This will permanently delete all associated data, including invoices, orders, and customer information.
//           </p>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Type "DELETE" to confirm
//             </label>
//             <input
//               type="text"
//               value={confirmationText}
//               onChange={handleChange}
//               placeholder="DELETE"
//               className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center`}
//             />
//             {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//           </div>
//         </div>

//         <div className="flex justify-end space-x-3 pt-4 border-t">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading || confirmationText !== 'DELETE'}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
//           >
//             {loading ? 'Deleting...' : 'Delete Account'}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };