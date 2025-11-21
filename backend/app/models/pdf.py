"""
PDF processing models
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class PDFMergeRequest(BaseModel):
    """Request model for PDF merge (handled via multiple file uploads)"""
    pass


class PDFSplitRequest(BaseModel):
    """Request model for PDF split"""
    pages: Optional[List[int]] = Field(
        default=None,
        description="List of page numbers to extract (1-indexed). If None, splits into individual pages"
    )
    page_ranges: Optional[List[str]] = Field(
        default=None,
        description="List of page ranges (e.g., ['1-3', '5-7']). If None, splits into individual pages"
    )


class PDFReorganizeRequest(BaseModel):
    """Request model for PDF page reorganization"""
    page_order: List[int] = Field(
        ...,
        description="New order of pages (1-indexed)"
    )


class PDFProcessingResponse(BaseModel):
    """Response model for PDF processing"""
    success: bool
    message: str
    filename: Optional[str] = None
    download_url: Optional[str] = None
    filenames: Optional[List[str]] = None
    download_urls: Optional[List[str]] = None
    total_pages: Optional[int] = None
    original_size: Optional[int] = None
    processed_size: Optional[int] = None

