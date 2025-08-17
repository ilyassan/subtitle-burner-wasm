import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from 'lucide-react'
import { useVideoProcessing } from '@/hooks/useVideoProcessing'
import { useVideoStore } from '@/stores/videoStore'

/**
 * Cancel Processing Confirmation Dialog
 * Uses Zustand store directly for state management
 */
export function CancelProcessingDialog() {
  const { showCancelModal, isCancelling, confirmCancelProcessing } = useVideoProcessing()
  const { setShowCancelModal } = useVideoStore()

  return (
    <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                Cancel Processing?
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-gray-600 leading-relaxed">
          Are you sure you want to cancel the current video processing operation? 
          This action will stop the process immediately and any progress will be lost.
        </AlertDialogDescription>
        
        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel 
            className="flex-1"
            disabled={isCancelling}
          >
            Continue Processing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmCancelProcessing}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}