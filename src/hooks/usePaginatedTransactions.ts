import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    );
  
    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return previousResponse;  // Return previous if the response is null
      }
  
      if (previousResponse === null) {
        return response;  // If there were no previous transactions, just return the new response
      }
      /* Bug 4 */
      // Append new transactions to existing transactions
      return {
        data: [...previousResponse.data, ...response.data],
        nextPage: response.nextPage,
      };
    });
  }, [fetchWithCache, paginatedTransactions]);
  

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
