import PyPDF2
pdf_path = r"C:\Users\User\Downloads\pseo_report_yapayzekapratik.pdf"
out_path = r"C:\Users\User\Projects\Pratik Yapay Zeka\pratik-yapay-zeka-astro\pdf_output.txt"
try:
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        with open(out_path, 'w', encoding='utf-8') as out_f:
            out_f.write(text)
except Exception as e:
    print(f"Error: {e}")
