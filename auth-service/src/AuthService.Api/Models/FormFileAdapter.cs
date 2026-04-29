using AuthService.Application.Interfaces;

namespace AuthService.Api.Models;

/// <summary>
/// Adaptador que implementa IFileData para envolver un objeto IFormFile.
/// </summary>
public class FormFileAdapter : IFileData
{
    private readonly IFormFile _formFile;
    private byte[]? _data;

    /// <summary>
    /// Inicializa una nueva instancia de FormFileAdapter.
    /// </summary>
    /// <param name="formFile">El archivo del formulario a adaptar.</param>
    public FormFileAdapter(IFormFile formFile)
    {
        ArgumentNullException.ThrowIfNull(formFile);
        _formFile = formFile;
    }

    /// <summary>
    /// Obtiene los datos del archivo como matriz de bytes.
    /// </summary>
    public byte[] Data
    {
        get
        {
            if (_data == null)
            {
                using var memoryStream = new MemoryStream();
                _formFile.CopyTo(memoryStream);
                _data = memoryStream.ToArray();
            }
            return _data;
        }
    }

    /// <summary>
    /// Obtiene el tipo de contenido del archivo.
    /// </summary>
    public string ContentType => _formFile.ContentType;

    /// <summary>
    /// Obtiene el nombre del archivo.
    /// </summary>
    public string FileName => _formFile.FileName;

    /// <summary>
    /// Obtiene el tamaño del archivo en bytes.
    /// </summary>
    public long Size => _formFile.Length;
}
