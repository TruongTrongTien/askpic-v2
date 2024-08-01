// constants.js
export const baseUrl = 'http://127.0.0.1:8000';

export const apiUrls = {
    answer: "/apis/question_resolver/ask_by_media",
    text: "/apis/question_resolver/ask_by_text",
    uploadDocument: "/apis/information_extractor/upload_document",
    getDocument: "/apis/information_extractor/get_all_documents",
    askInDocument: "/apis/information_extractor/ask",
    deleteDocument: "/apis/information_extractor/delete_document",
};
