#!/usr/bin/env python3
"""
Documentation Generator for Random Frames OS.

This script scans the project recursively for empty Markdown (.md) files
and automatically generates a professional starter template in them.
Existing files with content are preserved.
"""

import argparse
import logging
import sys
import time
from pathlib import Path

# Configure default logging format
logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Professional starter template for Markdown files
STARTER_TEMPLATE = """# Title

## Purpose

## Overview

## Features

## Components

## Workflow

## Future Enhancements

## Notes
"""

def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Scan for empty Markdown files and populate them with a starter template."
    )
    parser.add_argument(
        "-d", "--directory",
        type=Path,
        default=Path("."),
        help="Root directory to scan (default: current directory)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    return parser.parse_args()

def is_empty_markdown(file_path: Path) -> bool:
    """
    Check if a Markdown file is empty.
    
    Returns True if the file size is 0 or if it contains only whitespace.
    """
    try:
        # Quick check for 0-byte files
        if file_path.stat().st_size == 0:
            return True
        
        # Check if the file contains only whitespace
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            return not content.strip()
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}")
        return False

def generate_template(file_path: Path) -> bool:
    """
    Write the starter template into the specified file.
    
    Returns True on success, False otherwise.
    """
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(STARTER_TEMPLATE)
        return True
    except Exception as e:
        logger.error(f"Error writing to file {file_path}: {e}")
        return False

def generate_docs(root_dir: Path) -> None:
    """
    Recursively scan the directory and process Markdown files.
    Generates a summary report upon completion.
    """
    if not root_dir.exists() or not root_dir.is_dir():
        logger.error(f"Invalid directory path: {root_dir}")
        sys.exit(1)

    logger.info(f"Scanning project directory: {root_dir.resolve()}")
    
    total_files = 0
    generated_files = 0
    skipped_files = 0

    # Recursively find all .md files
    md_files = list(root_dir.rglob("*.md"))
    total_files = len(md_files)
    
    if total_files == 0:
        logger.info("No Markdown files found in the specified directory.")
        return

    logger.info(f"Found {total_files} Markdown file(s). Processing...")

    for index, file_path in enumerate(md_files, start=1):
        # Display progress occasionally
        if index % 10 == 0 or index == total_files:
            logger.info(f"Progress: {index}/{total_files} files checked...")
            
        if is_empty_markdown(file_path):
            logger.debug(f"Empty file found: {file_path}")
            if generate_template(file_path):
                generated_files += 1
                logger.info(f"Generated starter template for: {file_path}")
            else:
                skipped_files += 1
        else:
            logger.debug(f"File has content. Skipping: {file_path}")
            skipped_files += 1

    # Print Summary Report
    print("\n" + "="*50)
    print("         DOCUMENTATION GENERATION REPORT")
    print("="*50)
    print(f"Total Markdown files found : {total_files}")
    print(f"Templates generated        : {generated_files}")
    print(f"Files preserved/skipped    : {skipped_files}")
    print("="*50)

def main() -> None:
    """Main function to configure logging and execute the generator."""
    args = parse_args()

    # Adjust logging level based on arguments
    if args.verbose:
        logger.setLevel(logging.DEBUG)

    start_time = time.time()
    
    generate_docs(args.directory)
    
    elapsed_time = time.time() - start_time
    logger.info(f"Documentation generation completed in {elapsed_time:.2f} seconds.")

if __name__ == "__main__":
    main()
