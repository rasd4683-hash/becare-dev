
ALTER TABLE public.site_visitors
ADD COLUMN phone text,
ADD COLUMN national_id text,
ADD COLUMN linked_request_id uuid REFERENCES public.insurance_requests(id),
ADD COLUMN linked_conversation_id uuid REFERENCES public.chat_conversations(id);
