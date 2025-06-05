'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const GET_PREDICTION_DETAILS = gql`
  query GetPredictionDetails($id: String!) {
    predictions(id: $id) {
      id
      name
      description
      outcome1
      outcome2
      optionalReward
      b
      url
      createdAt
      shares {
        items {
          id
          buyOrSell
          outcome
          amount
          price
          createdAt
        }
      }
    }
  }
`

type PredictionDetailsProps = {
  predictionId: string
  onClose: () => void
}

export default function PredictionDetails({
  predictionId,
  onClose,
}: PredictionDetailsProps) {
  const { loading, error, data } = useQuery(GET_PREDICTION_DETAILS, {
    variables: { id: predictionId },
  })

  useEffect(() => {
    if (loading) {
      toast.loading('Loading prediction details...', { id: 'loading-details' })
    } else {
      toast.dismiss('loading-details')
    }
  }, [loading])

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.message}`)
    }
  }, [error])

  const prediction = data?.predictions

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p>Loading prediction details...</p>
        </div>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">Error loading prediction details</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">{prediction.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{prediction.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Outcome 1</h3>
              <p className="text-gray-600">{prediction.outcome1}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Outcome 2</h3>
              <p className="text-gray-600">{prediction.outcome2}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Created</h3>
              <p className="text-gray-600">
                {format(parseInt(prediction.createdAt), 'PPp')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Optional Reward</h3>
              <p className="text-gray-600">{prediction.optionalReward || 'N/A'} USDT</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">URL</h3>
              <a 
                href={prediction.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {prediction.url}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Shares</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prediction.shares.items.map((share: any) => (
                    <tr key={share.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {share.buyOrSell ? 'Buy' : 'Sell'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {share.outcome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseInt(share.amount) / 1e18} USDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {share.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseInt(share.createdAt), 'PPp')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 