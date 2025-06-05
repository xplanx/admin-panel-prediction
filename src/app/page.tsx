'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { format } from 'date-fns'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import CreatePrediction from '@/components/CreatePrediction'
import PredictionDetails from '@/components/PredictionDetails'

const GET_PREDICTIONS = gql`
  query GetPredictions($orderBy: String, $orderDirection: String) {
    predictionss(orderBy: $orderBy, orderDirection: $orderDirection) {
      items {
        id
        name
        description
        outcome1
        outcome2
        optionalReward
        b
        url
        createdAt
      }
    }
  }
`

export default function Home() {
  const [orderBy, setOrderBy] = useState('createdAt')
  const [orderDirection, setOrderDirection] = useState('desc')
  const [selectedPredictionId, setSelectedPredictionId] = useState<string | null>(null)

  const { loading, error, data } = useQuery(GET_PREDICTIONS, {
    variables: { orderBy, orderDirection },
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const predictions = data?.predictionss?.items || []

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
            value={`${orderBy}_${orderDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('_')
              setOrderBy(field)
              setOrderDirection(direction)
            }}
            className="input-field max-w-xs"
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>

        <div className="grid gap-6">
          {predictions.map((prediction: any) => (
            <div
              key={prediction.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{prediction.name}</h2>
                  <p className="text-gray-600 mb-4">{prediction.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Outcomes: {prediction.outcome1} vs {prediction.outcome2}</span>
                    {prediction.optionalReward && (
                      <span>Reward: {prediction.optionalReward} USDT</span>
                    )}
                    <span>Created: {format(parseInt(prediction.createdAt), 'PPp')}</span>
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
