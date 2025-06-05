'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { format } from 'date-fns'

const GET_PREDICTION_DETAILS = gql`
  query GetPredictionDetails($id: ID!) {
    prediction(id: $id) {
      id
      name
      description
      outcome1
      outcome2
      createdAt
      status
      totalInvested
      bets {
        id
        user {
          address
        }
        outcome
        amount
        createdAt
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

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const prediction = data?.prediction

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
              <h3 className="text-lg font-semibold mb-2">Status</h3>
              <p className="text-gray-600">{prediction.status}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Created</h3>
              <p className="text-gray-600">
                {format(new Date(prediction.createdAt), 'PPp')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Invested</h3>
              <p className="text-gray-600">{prediction.totalInvested} ETH</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Bets</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prediction.bets.map((bet: any) => (
                    <tr key={bet.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bet.user.address.slice(0, 6)}...{bet.user.address.slice(-4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bet.outcome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bet.amount} ETH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(bet.createdAt), 'PPp')}
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