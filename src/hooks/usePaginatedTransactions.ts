import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, clearCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }

      const responseData = (paginatedTransactions?.data ?? []).concat(response.data)
      return { data: responseData, nextPage: response.nextPage }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback((changed: boolean) => {
    setPaginatedTransactions(null)
    if(changed) {clearCache()}
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
