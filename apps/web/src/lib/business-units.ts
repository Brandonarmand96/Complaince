import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth';
export type BusinessUnitType='DIVISION'|'SUBSIDIARY'|'FUNCTION'|'OTHER';
export type BusinessUnit={id:string;organizationId:string;name:string;type:BusinessUnitType;parentUnitId:string|null;parentName:string|null;version:number;createdAt:string;updatedAt:string};
export type BusinessUnitInput={name:string;type:BusinessUnitType;parentUnitId?:string|null};
type Page={data:BusinessUnit[];total:number;page:number;limit:number};
export const businessUnitKeys={all:['business-units'] as const,list:(page:number)=>['business-units','list',page] as const,detail:(id:string)=>['business-units','detail',id] as const};
export function useBusinessUnits(page:number,limit=20){const{authenticatedFetch}=useAuth();return useQuery({queryKey:businessUnitKeys.list(page),queryFn:()=>authenticatedFetch<Page>(`/api/v1/business-units?page=${page}&limit=${limit}`)});}
export function useBusinessUnit(id:string){const{authenticatedFetch}=useAuth();return useQuery({queryKey:businessUnitKeys.detail(id),queryFn:()=>authenticatedFetch<BusinessUnit>(`/api/v1/business-units/${id}`),enabled:Boolean(id)});}
export function useCreateBusinessUnit(){const{authenticatedFetch}=useAuth();const client=useQueryClient();return useMutation({mutationFn:(input:BusinessUnitInput)=>authenticatedFetch<BusinessUnit>('/api/v1/business-units',{method:'POST',body:JSON.stringify(input)}),onSuccess:async record=>{client.setQueryData(businessUnitKeys.detail(record.id),record);await client.invalidateQueries({queryKey:businessUnitKeys.all});}});}
export function useUpdateBusinessUnit(id:string){const{authenticatedFetch}=useAuth();const client=useQueryClient();return useMutation({mutationFn:(input:Partial<BusinessUnitInput>&{version:number})=>authenticatedFetch<BusinessUnit>(`/api/v1/business-units/${id}`,{method:'PATCH',body:JSON.stringify(input)}),onSuccess:async record=>{client.setQueryData(businessUnitKeys.detail(id),record);await client.invalidateQueries({queryKey:businessUnitKeys.all});}});}
