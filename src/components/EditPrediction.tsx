'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'

const GET_PREDICTION = gql`
  query GetPrediction($id: ID!) {
    prediction(id: $id) {
      id
      name
      description
      outcome1
      outcome2
      url
    }
  }
`

const UPDATE_PREDICTION = gql`
  mutation UpdatePrediction(
    $id: ID!
    $name: String!
    $description: String!
    $outcome1: String!
    $outcome2: String!
    $url: String!
  ) {
    updatePrediction(
      id: $id
      name: $name
      description: $description
      outcome1: $outcome1
      outcome2: $outcome2
      url: $url
    ) {
      id
      name
    }
  }
`

const predictionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  outcome1: z.string().min(1, 'Outcome 1 is required'),
  outcome2: z.string().min(1, 'Outcome 2 is required'),
  url: z.string().url('Invalid URL'),
})

type PredictionFormData = z.infer<typeof predictionSchema>

type EditPredictionProps = {
  predictionId: string
  onClose: () => void
}

export default function EditPrediction({
  predictionId,
  onClose,
}: EditPredictionProps) {
  const [updatePrediction] = useMutation(UPDATE_PREDICTION)

  const { loading, error, data } = useQuery(GET_PREDICTION, {
    variables: { id: predictionId },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
    defaultValues: data?.prediction,
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const onSubmit = async (formData: PredictionFormData) => {
    try {
      await updatePrediction({
        variables: {
          id: predictionId,
          ...formData,
        },
        refetchQueries: ['GetPredictions'],
      })
      onClose()
    } catch (error) {
      console.error('Error updating prediction:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Edit Prediction</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              {...register('name')}
              className="input-field"
              placeholder="Prediction name"
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
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 