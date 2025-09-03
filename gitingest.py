#!/usr/bin/env python3
"""
Git Ingester - Combines all source files into a single text file
Fixed version with proper error handling and debugging
"""

import os
import mimetypes
import argparse
from pathlib import Path
from typing import Set, List


def is_text_file(file_path: str) -> bool:
    """Check if a file is a text file based on its mime type and extension."""
    try:
        # Check mime type
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type and mime_type.startswith('text/'):
            return True
        
        # Additional checks for common code file extensions
        text_extensions = {
            '.py', '.js', '.html', '.css', '.json', '.yaml', '.yml', 
            '.md', '.txt', '.toml', '.cfg', '.conf', '.ini', '.xml',
            '.sql', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat',
            '.ts', '.tsx', '.jsx', '.vue', '.svelte', '.go', '.rs',
            '.java', '.kt', '.scala', '.rb', '.php', '.cpp', '.c',
            '.h', '.hpp', '.cs', '.fs', '.clj', '.hs', '.ml', '.elm',
            '.r', '.R', '.jl', '.pl', '.pm', '.tcl', '.lua', '.nim',
            '.crystal', '.d', '.dart', '.ex', '.exs', '.erl', '.hrl',
            '.proto', '.graphql', '.gql', '.dockerfile', '.makefile',
            '.cmake', '.gradle', '.sbt', '.maven', '.pom', '.lock',
            '.gitignore', '.gitattributes', '.editorconfig', '.env'
        }
        
        file_ext = Path(file_path).suffix.lower()
        if file_ext in text_extensions:
            return True
            
        # Check files without extensions that are commonly text
        filename = Path(file_path).name.lower()
        text_filenames = {
            'readme', 'license', 'changelog', 'dockerfile', 'makefile',
            'rakefile', 'gemfile', 'procfile', 'requirements', 'pipfile'
        }
        if filename in text_filenames:
            return True
            
        return False
    except Exception as e:
        print(f"Error checking file type for {file_path}: {e}")
        return False


def should_skip(file_path: str, skip_patterns: Set[str]) -> bool:
    """Check if a file should be skipped based on patterns."""
    # Default skip patterns
    default_skip_patterns = {
        'node_modules', '.git', '__pycache__', '.pytest_cache',
        'dist', 'build', '.next', '.nuxt', 'target', 'bin', 'obj',
        '.vscode', '.idea', '.DS_Store', 'thumbs.db',
        '*.pyc', '*.pyo', '*.pyd', '*.so', '*.dylib', '*.dll',
        '*.exe', '*.app', '*.deb', '*.rpm', '*.dmg', '*.pkg',
        '*.zip', '*.tar', '*.gz', '*.rar', '*.7z',
        '*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.ico',
        '*.mp3', '*.mp4', '*.avi', '*.mov', '*.wmv', '*.flv',
        '*.pdf', '*.doc', '*.docx', '*.xls', '*.xlsx', '*.ppt', '*.pptx',
        '.env.local', '.env.*.local', 'coverage', '.coverage',
        '.mypy_cache', '.tox', 'venv', '.venv', 'env'
    }
    
    all_patterns = default_skip_patterns.union(skip_patterns)
    path_parts = Path(file_path).parts
    filename = Path(file_path).name
    
    for pattern in all_patterns:
        # Check if pattern matches any part of the path
        if pattern in path_parts:
            return True
        # Check if pattern matches filename
        if pattern == filename:
            return True
        # Simple wildcard matching for extensions
        if pattern.startswith('*.') and filename.endswith(pattern[1:]):
            return True
    
    return False


def ingest_repository(directory: str, output_file: str, skip_patterns: Set[str] = None):
    """Ingest all text files from a repository into a single file."""
    if skip_patterns is None:
        skip_patterns = set()
    
    files_processed = 0
    files_skipped = 0
    
    print(f"Starting ingestion of directory: {directory}")
    print(f"Output file: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Write header
        outfile.write("=" * 80 + "\n")
        outfile.write("REPOSITORY INGESTION\n")
        outfile.write(f"Source Directory: {os.path.abspath(directory)}\n")
        outfile.write("=" * 80 + "\n\n")
        
        # Walk through all files
        for root, dirs, files in os.walk(directory):
            # Filter out directories that should be skipped
            dirs[:] = [d for d in dirs if not should_skip(os.path.join(root, d), skip_patterns)]
            
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, directory)
                
                print(f"Processing: {relative_path}")
                
                # Skip if file should be skipped
                if should_skip(file_path, skip_patterns):
                    print(f"  Skipped: {relative_path}")
                    files_skipped += 1
                    continue
                
                # Skip if not a text file
                if not is_text_file(file_path):
                    print(f"  Skipped (binary): {relative_path}")
                    files_skipped += 1
                    continue
                
                try:
                    # Write file header
                    outfile.write(f"\n{'='*60}\n")
                    outfile.write(f"FILE: {relative_path}\n")
                    outfile.write(f"{'='*60}\n\n")
                    
                    # Read and write file content
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                        content = infile.read()
                    
                    outfile.write(content)
                    
                    # Ensure file ends with newline
                    if content and not content.endswith('\n'):
                        outfile.write('\n')
                    
                    files_processed += 1
                    print(f"  Processed: {relative_path}")
                    
                except Exception as e:
                    print(f"  Error reading {relative_path}: {e}")
                    files_skipped += 1
        
        # Write footer
        outfile.write("\n" + "=" * 80 + "\n")
        outfile.write("END OF REPOSITORY INGESTION\n")
        outfile.write(f"Files processed: {files_processed}\n")
        outfile.write(f"Files skipped: {files_skipped}\n")
        outfile.write("=" * 80 + "\n")
    
    print(f"\nIngestion complete!")
    print(f"Files processed: {files_processed}")
    print(f"Files skipped: {files_skipped}")
    print(f"Output written to: {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Ingest all text files from a repository into a single file"
    )
    parser.add_argument(
        "directory", 
        nargs='?', 
        default=".", 
        help="Directory to ingest (default: current directory)"
    )
    parser.add_argument(
        "-o", "--output", 
        default="repository_ingestion.txt",
        help="Output file name (default: repository_ingestion.txt)"
    )
    parser.add_argument(
        "--skip", 
        action="append", 
        help="Additional patterns to skip (can be used multiple times)"
    )
    
    args = parser.parse_args()
    
    print(f"Arguments parsed: directory={args.directory}, output={args.output}")
    
    # Validate directory
    if not os.path.isdir(args.directory):
        print(f"Error: Directory '{args.directory}' does not exist.")
        return 1
    
    # Prepare skip patterns
    skip_patterns = set(args.skip or [])
    
    try:
        ingest_repository(args.directory, args.output, skip_patterns)
        return 0
    except Exception as e:
        print(f"Error during ingestion: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
