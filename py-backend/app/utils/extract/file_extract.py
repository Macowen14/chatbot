from PyPDF2 import PdfReader
from docx import Document
import io # To handle the file content in memory

from app.models.schemas import Document

async def extract_text_from_file(file: Document) -> str:
    """
    Intelligently extracts text content based on the file's MIME type.
    """
    
    # Read the file content bytes into an in-memory buffer
    file_bytes = await file.read()
    
    # Wrap the bytes in a BytesIO object so libraries can read it like a real file
    file_like_object = io.BytesIO(file_bytes)
    
    mime_type = file.content_type
    extracted_text = ""

    try:
        if mime_type == "text/plain":
            # Simple text file
            extracted_text = file_bytes.decode('utf-8')
            
        elif mime_type == "application/pdf":
            # PDF file (requires PyPDF2/pypdf)
            # reader = PdfReader(file_like_object)
            # for page in reader.pages:
            #     extracted_text += page.extract_text() + "\n"
            extracted_text = f"// PDF Content from {file.filename} //\n\n[PDF extraction logic would run here.]"
            
        elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            # DOCX file (requires python-docx)
            # document = Document(file_like_object)
            # for paragraph in document.paragraphs:
            #     extracted_text += paragraph.text + "\n"
            extracted_text = f"// DOCX Content from {file.filename} //\n\n[DOCX extraction logic would run here.]"
            
        elif mime_type.startswith("image/"):
            # Image file (requires pytesseract and Pillow/PIL for OCR)
            extracted_text = f"// Image OCR Content from {file.filename} //\n\n[OCR logic using Tesseract would run here.]"

        else:
            extracted_text = f"Unsupported file type: {mime_type}. Metadata: {file.filename}"

    except Exception as e:
        # Handle cases where the file might be corrupted or the library fails
        extracted_text = f"Error processing file {file.filename}: {str(e)}"

    # IMPORTANT: Reset the file pointer for subsequent reads if needed, 
    # though in FastAPI's UploadFile context, we typically consume the stream once.
    # We use file_bytes.decode() or io.BytesIO() to work with the content safely.
    
    return extracted_text