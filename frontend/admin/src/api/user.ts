import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IUser, IUserCreate } from "shared";

export function useUsers() {
 return useQuery<IUser[]>({
    queryKey: ["/api/user"],
    queryFn: async () => axios
      .get<IUser[]>("/api/user")
      .then((res) => res.data),
  });
}

export function useUser(id: number | undefined) {
  return useQuery<IUser>({
    queryKey: ["/api/user", id],
    enabled: !!id,
    queryFn: async () => axios
      .get<IUser>(`/api/user/${id}`)
      .then((res) => res.data),
  });
}

export function useCreateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: IUserCreate) => axios
      .post<IUser>("/api/user", data)
      .then((res) => res.data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["/api/user"] });
    },
  })
}
