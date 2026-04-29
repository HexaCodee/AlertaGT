using System;
using System.Threading.Tasks;
using AuthService.Api.Models;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace AuthService.Api.ModelBinders;

/// <summary>
/// Vinculador de modelos para tipos que implementan IFileData.
/// </summary>
public class FileDataModelBinder : IModelBinder
{
    /// <summary>
    /// Vincula el modelo desde el contexto de carpetas de la solicitud.
    /// </summary>
    /// <param name="bindingContext">El contexto de vinculación de modelos.</param>
    /// <returns>Una tarea que representa la operación asincrónica.</returns>
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        ArgumentNullException.ThrowIfNull(bindingContext);

        // Verificar si el tipo de destino implementa IFileData
        if (!typeof(IFileData).IsAssignableFrom(bindingContext.ModelType))
        {
            return Task.CompletedTask;
        }

        var request = bindingContext.HttpContext.Request;

        // Buscar el archivo en la request
        var file = request.Form.Files.GetFile(bindingContext.FieldName);

        if (file != null && file.Length > 0)
        {
            var fileData = new FormFileAdapter(file);
            bindingContext.Result = ModelBindingResult.Success(fileData);
        }
        else
        {
            // No hay archivo, establecer como null
            bindingContext.Result = ModelBindingResult.Success(null);
        }

        return Task.CompletedTask;
    }
}

/// <summary>
/// Proveedor de vinculadores de modelos para tipos que implementan IFileData.
/// </summary>
public class FileDataModelBinderProvider : IModelBinderProvider
{
    /// <summary>
    /// Obtiene el vinculador de modelos apropiado para el tipo especificado.
    /// </summary>
    /// <param name="context">El contexto del proveedor de vinculadores de modelos.</param>
    /// <returns>El vinculador de modelos si el tipo implementa IFileData; de lo contrario, null.</returns>
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        if (typeof(IFileData).IsAssignableFrom(context.Metadata.ModelType))
        {
            return new FileDataModelBinder();
        }

        return null;
    }
}
