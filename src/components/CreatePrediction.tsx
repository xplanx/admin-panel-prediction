'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'

// TODO: Replace with actual ABI
const CONTRACT_ABI = [{"inputs":[{"internalType":"string","name":"metadata","type":"string"},{"internalType":"uint64","name":"deadline","type":"uint64"},{"internalType":"bytes32","name":"outcome1","type":"bytes32"},{"internalType":"bytes32","name":"outcome2","type":"bytes32"},{"internalType":"uint256","name":"optionalReward","type":"uint256"},{"internalType":"int128","name":"b","type":"int128"}],"name":"createMarket","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"}] as const

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const USDT_ADDRESS = '0x9d655A9a4F711ddb561CA108976072D1E24640B7' as `0x${string}`

const USDT_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
] as const

const predictionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  outcome1: z.string().min(1, 'Outcome 1 is required').default('yes'),
  outcome2: z.string().min(1, 'Outcome 2 is required').default('no'),
  url: z.string().url('Invalid URL').default('https://picsum.photos/300/200'),
  optionalReward: z.string().transform((val) => BigInt(val)),
  b: z.string().transform((val) => BigInt(val)),
  deadline: z.string().transform((val) => BigInt(Math.floor(new Date(val).getTime() / 1000))),
})

type PredictionFormData = z.infer<typeof predictionSchema>

type CreatePredictionProps = {
  onClose?: () => void
}

export default function CreatePrediction({ onClose }: CreatePredictionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null)
  const BLOCK_EXPLORER_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
  })

  const { writeContractAsync, data: hash } = useWriteContract()
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>(undefined)
  const [formData, setFormData] = useState<PredictionFormData | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalHash,
  })

  const onSubmit = async (data: PredictionFormData) => {
    try {
      setIsApproving(true)
      const toastId = toast.loading('Approving token...')
      setLoadingToastId(toastId)
      setFormData(data)

      // First approve the token
      const approvalAmount = data.optionalReward * BigInt(10 ** 6)
      const approvalResult = await writeContractAsync({
        abi: USDT_ABI,
        address: USDT_ADDRESS,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, approvalAmount],
      })
      setApprovalHash(approvalResult)

    } catch (error) {
      console.error('Error in approval:', error)
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }
      toast.error('Failed to approve token. Please try again.')
      setIsApproving(false)
    }
  }

  // Watch for approval completion and then create market
  useEffect(() => {
    const createMarketAfterApproval = async () => {
      if (isApprovalSuccess && formData) {
        try {
          if (loadingToastId) {
            toast.dismiss(loadingToastId)
          }
          const newToastId = toast.loading('Creating prediction market...')
          setLoadingToastId(newToastId)

          const metaData: string = JSON.stringify({name: formData.name, description: formData.description, url: formData.url});
          await writeContractAsync({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
            functionName: 'createMarket',
            args: [
              metaData,
              formData.deadline,
              `0x0100000000000000000000000000000000000000000000000000000000000000`,
              `0x0200000000000000000000000000000000000000000000000000000000000000`,
              formData.optionalReward,
              formData.b,
            ]
          })
          setIsApproving(false)
        } catch (error) {
          debugger;
          console.error('Error creating market:', error)
          if (loadingToastId) {
            toast.dismiss(loadingToastId)
          }
          toast.error('Failed to create market. Please try again.')
          setIsApproving(false)
        }
      }
    }

    createMarketAfterApproval()
  }, [isApprovalSuccess, formData])

  // Watch for transaction completion
  useEffect(() => {
    if (hash && !isTransactionLoading) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }
      if (isSuccess) {
        toast.success('Prediction created successfully!')
      }
    }
  }, [hash, isTransactionLoading, isSuccess, loadingToastId])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        Create New Prediction
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Prediction</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  {...register('name')}
                  className="input-field"
                  placeholder="Prediction name"
                  readOnly={!!hash}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="input-field"
                  rows={3}
                  placeholder="Prediction description"
                  readOnly={!!hash}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Outcome 1
                </label>
                <input
                  {...register('outcome1')}
                  className="input-field"
                  placeholder="First possible outcome"
                  readOnly={!!hash}
                />
                {errors.outcome1 && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.outcome1.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Outcome 2
                </label>
                <input
                  {...register('outcome2')}
                  className="input-field"
                  placeholder="Second possible outcome"
                  readOnly={!!hash}
                />
                {errors.outcome2 && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.outcome2.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  {...register('url')}
                  className="input-field"
                  placeholder="https://example.com"
                  readOnly={!!hash}
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Optional Reward (in wei)
                </label>
                <input
                  {...register('optionalReward')}
                  type="number"
                  className="input-field"
                  placeholder="0"
                  readOnly={!!hash}
                />
                {errors.optionalReward && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.optionalReward.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  B Value
                </label>
                <input
                  {...register('b')}
                  type="number"
                  className="input-field"
                  placeholder="0"
                  readOnly={!!hash}
                />
                {errors.b && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.b.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  {...register('deadline')}
                  type="datetime-local"
                  className="input-field"
                  min={new Date().toISOString().slice(0, 16)}
                  readOnly={!!hash}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.deadline.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                {!hash ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary"
                      disabled={isApproving || isTransactionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isApproving || isTransactionLoading}
                      className="btn-primary"
                    >
                      {isApproving ? 'Approving...' : isTransactionLoading ? 'Creating...' : 'Create Prediction'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                    <a
                      href={`${BLOCK_EXPLORER_URL}/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      View on Explorer
                    </a>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 