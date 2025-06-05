'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'

// TODO: Replace with actual ABI
const CONTRACT_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"bytes32","name":"marketID","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"outcome","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint64","name":"price","type":"uint64"}],"name":"BuyShares","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"marketId","type":"bytes32"},{"indexed":false,"internalType":"string","name":"assertedOutcome","type":"string"},{"indexed":true,"internalType":"bytes32","name":"assertionId","type":"bytes32"}],"name":"MarketAsserted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"marketId","type":"bytes32"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"description","type":"string"},{"indexed":false,"internalType":"string","name":"url","type":"string"},{"indexed":false,"internalType":"address","name":"outcome0","type":"address"},{"indexed":false,"internalType":"address","name":"outcome1","type":"address"},{"indexed":false,"internalType":"uint64","name":"price","type":"uint64"}],"name":"MarketInitialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"marketId","type":"bytes32"}],"name":"MarketResolved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"marketID","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"outcomeResult","type":"bytes32"}],"name":"MarketResolved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"bytes32","name":"marketID","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"outcome","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"},{"indexed":false,"internalType":"uint64","name":"price","type":"uint64"}],"name":"SellShares","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"marketId","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensCreated","type":"uint256"}],"name":"TokensCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"marketId","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensRedeemed","type":"uint256"}],"name":"TokensRedeemed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"marketId","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"outcome1Tokens","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"outcome2Tokens","type":"uint256"}],"name":"TokensSettled","type":"event"},{"inputs":[{"internalType":"bytes32","name":"marketID","type":"bytes32"},{"internalType":"bytes32","name":"outcome","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint64","name":"price","type":"uint64"}],"name":"buy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"marketName","type":"string"},{"internalType":"string","name":"marketDescription","type":"string"},{"internalType":"string","name":"url","type":"string"},{"internalType":"string","name":"outcome1","type":"string"},{"internalType":"string","name":"outcome2","type":"string"},{"internalType":"uint256","name":"optionalReward","type":"uint256"},{"internalType":"int128","name":"b","type":"int128"}],"name":"createMarket","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"marketID","type":"bytes32"},{"internalType":"bytes32","name":"outcome","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"payout","type":"uint256"},{"internalType":"uint64","name":"price","type":"uint64"}],"name":"sell","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}] as const

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

const predictionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  outcome1: z.string().min(1, 'Outcome 1 is required'),
  outcome2: z.string().min(1, 'Outcome 2 is required'),
  url: z.string().url('Invalid URL'),
  optionalReward: z.string().transform((val) => BigInt(val)),
  b: z.string().transform((val) => BigInt(val)),
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

  const { writeContract, data: hash } = useWriteContract()

  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const onSubmit = async (data: PredictionFormData) => {
    try {
      const toastId = toast.loading('Creating prediction...')
      setLoadingToastId(toastId)
      await writeContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'createMarket',
        args: [
          data.name,
          data.description,
          data.url,
          data.outcome1,
          data.outcome2,
          data.optionalReward,
          data.b,
        ],
        gas: BigInt(100000),
        maxFeePerGas: BigInt(1000000000),
        maxPriorityFeePerGas: BigInt(1000000000),
      })
    } catch (error) {
      console.error('Error creating prediction:', error)
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }
      toast.error('Failed to create prediction. Please try again.')
    }
  }

  // Watch for transaction completion
  useEffect(() => {
    if (hash && !isTransactionLoading) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }
      if (isSuccess) {
        toast.success('Prediction created successfully!')
        setIsOpen(false)
        onClose?.()
      }
    }
  }, [hash, isTransactionLoading, isSuccess, loadingToastId, onClose])

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

              <div className="flex justify-end gap-2 mt-6">
                {!hash ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isTransactionLoading}
                      className="btn-primary"
                    >
                      {isSubmitting || isTransactionLoading ? 'Creating...' : 'Create Prediction'}
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