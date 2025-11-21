"""
PDF processing API endpoints
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from typing import List, Optional
from app.models.pdf import PDFProcessingResponse, PDFSplitRequest, PDFReorganizeRequest
from app.services.pdf_service import merge_pdfs, compress_pdf, split_pdf, reorganize_pdf
from app.utils.file_handler import save_upload_file, delete_file, generate_unique_filename
from app.utils.validators import validate_pdf_format
from app.config import TEMP_DIR
import json

router = APIRouter(prefix="/pdf", tags=["PDF"])


@router.post("/merge", response_model=PDFProcessingResponse)
async def merge_pdf_files(
    files: List[UploadFile] = File(..., description="PDF files to merge (in order)")
):
    """
    Merge multiple PDF files into one
    
    Files will be merged in the order they are uploaded
    """
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required for merging")
    
    # Validate all files
    for file in files:
        if not validate_pdf_format(file.filename):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a valid PDF")
    
    input_paths = []
    output_path = None
    
    try:
        # Save all uploaded files
        for file in files:
            input_path = await save_upload_file(file)
            input_paths.append(input_path)
        
        # Create output path
        output_filename = generate_unique_filename("merged.pdf")
        output_path = TEMP_DIR / output_filename
        
        # Merge PDFs
        result = merge_pdfs(input_paths, output_path)
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        return result
    
    finally:
        # Clean up input files
        for input_path in input_paths:
            delete_file(input_path)


@router.post("/compress", response_model=PDFProcessingResponse)
async def compress_pdf_file(
    file: UploadFile = File(..., description="PDF file to compress")
):
    """
    Compress a PDF file
    
    Uses garbage collection, deflate compression, and content stream cleaning
    """
    # Validate file format
    if not validate_pdf_format(file.filename):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")
    
    input_path = None
    output_path = None
    
    try:
        # Save uploaded file
        input_path = await save_upload_file(file)
        
        # Create output path
        output_filename = generate_unique_filename(f"compressed_{file.filename}")
        output_path = TEMP_DIR / output_filename
        
        # Compress PDF
        result = compress_pdf(input_path, output_path)
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        return result
    
    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/split", response_model=PDFProcessingResponse)
async def split_pdf_file(
    file: UploadFile = File(..., description="PDF file to split"),
    pages: Optional[str] = Form(None, description="Comma-separated page numbers (e.g., '1,3,5')"),
    page_ranges: Optional[str] = Form(None, description="Comma-separated page ranges (e.g., '1-3,5-7')")
):
    """
    Split a PDF file into multiple files
    
    - If neither pages nor page_ranges is specified, splits into individual pages
    - **pages**: Extract specific pages (1-indexed)
    - **page_ranges**: Extract page ranges (e.g., '1-3,5-7')
    """
    # Validate file format
    if not validate_pdf_format(file.filename):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")
    
    input_path = None
    
    try:
        # Save uploaded file
        input_path = await save_upload_file(file)
        
        # Parse pages and page ranges
        pages_list = None
        ranges_list = None
        
        if pages:
            pages_list = [int(p.strip()) for p in pages.split(',')]
        
        if page_ranges:
            ranges_list = [r.strip() for r in page_ranges.split(',')]
        
        # Create output directory
        output_dir = TEMP_DIR / f"split_{generate_unique_filename('').replace('.', '')}"
        output_dir.mkdir(exist_ok=True)
        
        # Split PDF
        result = split_pdf(input_path, output_dir, pages_list, ranges_list)
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        return result
    
    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/reorganize", response_model=PDFProcessingResponse)
async def reorganize_pdf_pages(
    file: UploadFile = File(..., description="PDF file to reorganize"),
    page_order: str = Form(..., description="Comma-separated new page order (e.g., '3,1,2,4')")
):
    """
    Reorganize PDF pages according to specified order
    
    - **page_order**: New order of pages as comma-separated numbers (1-indexed)
    - Example: '3,1,2' will reorder pages so page 3 comes first, then page 1, then page 2
    """
    # Validate file format
    if not validate_pdf_format(file.filename):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")
    
    input_path = None
    output_path = None
    
    try:
        # Parse page order
        page_order_list = [int(p.strip()) for p in page_order.split(',')]
        
        # Save uploaded file
        input_path = await save_upload_file(file)
        
        # Create output path
        output_filename = generate_unique_filename(f"reorganized_{file.filename}")
        output_path = TEMP_DIR / output_filename
        
        # Reorganize PDF
        result = reorganize_pdf(input_path, output_path, page_order_list)
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        return result
    
    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)

