'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { format } from 'date-fns'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import CreatePrediction from '@/components/CreatePrediction'
import PredictionDetails from '@/components/PredictionDetails'

const GET_PREDICTIONS = gql`
  query GetPredictions($orderBy: String) {
    predictions(orderBy: $orderBy) {
      id
      name
      description
      outcome1
      outcome2
      createdAt
      status
      totalInvested
    }
  }
`

export default function Home() {
  const [orderBy, setOrderBy] = useState('createdAt_DESC')
  const [selectedPredictionId, setSelectedPredictionId] = useState<string | null>(null)

  const { loading, error, data } = useQuery(GET_PREDICTIONS, {
    variables: { orderBy },
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Predictions</h1>
          <div className="flex items-center gap-4">
            <CreatePrediction />
            <ConnectButton />
          </div>
        </div>

        <div className="mb-4">
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="createdAt_DESC">Newest First</option>
            <option value="createdAt_ASC">Oldest First</option>
            <option value="totalInvested_DESC">Most Invested</option>
            <option value="totalInvested_ASC">Least Invested</option>
          </select>
        </div>

        <div className="grid gap-6">
          {data?.predictions.map((prediction: any) => (
            <div
              key={prediction.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{prediction.name}</h2>
                  <p className="text-gray-600 mb-4">{prediction.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Created: {format(new Date(prediction.createdAt), 'PPp')}</span>
                    <span>Status: {prediction.status}</span>
                    <span>Total Invested: {prediction.totalInvested} ETH</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPredictionId(prediction.id)}
                    className="btn-secondary"
                  >
                    View Details
                  </button>
                  <button className="btn-primary">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPredictionId && (
        <PredictionDetails
          predictionId={selectedPredictionId}
          onClose={() => setSelectedPredictionId(null)}
        />
      )}
    </main>
  )
}
