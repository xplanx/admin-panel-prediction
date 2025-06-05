'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { format } from 'date-fns'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
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

  const { loading, error, data, refetch } = useQuery(GET_PREDICTIONS, {
    variables: { orderBy, orderDirection },
  })

  useEffect(() => {
    if (loading) {
      toast.loading('Loading predictions...', { id: 'loading-predictions' })
    } else {
      toast.dismiss('loading-predictions')
    }
  }, [loading])

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.message}`)
    }
  }, [error])

  const predictions = data?.predictionss?.items || []

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Predictions</h1>
          <div className="flex items-center gap-4">
            <CreatePrediction onClose={() => refetch()} />
            <ConnectButton />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
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
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reload
          </button>
        </div>

        <div className="grid gap-6">
          {predictions.map((prediction: any) => (
            <div
              key={prediction.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">{prediction.name}</h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(prediction.id);
                        toast.success('Prediction ID copied to clipboard');
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Copy ID to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
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
