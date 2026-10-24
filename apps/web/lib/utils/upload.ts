/**
 * Uploads a file to Cloudflare R2 via the backend proxy
 * @param file The file to upload
 * @param folder Optional folder path in the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File, folder?: string): Promise<string> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
        formData.append('folder', folder);
    }

    const response = await fetch(`${apiUrl}/storage/upload`, {
        method: 'POST',
        headers: {
            // Do NOT set Content-Type — browser sets it automatically with boundary for FormData
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error text');
        console.error('Upload failed status:', response.status);
        console.error('Upload failed body:', errorText);
        throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const { fileUrl } = result.data || result;

    return fileUrl;
}

