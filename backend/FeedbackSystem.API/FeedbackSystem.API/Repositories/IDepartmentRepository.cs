using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Repositories;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<List<Department>> GetAllAsync(CancellationToken ct = default);
    Task<bool> DepartmentNameExistsAsync(string name, int? excludeId = null, CancellationToken ct = default);
    Task<Department> AddAsync(Department department, CancellationToken ct = default);
    Task UpdateAsync(Department department, CancellationToken ct = default);
    Task DeleteAsync(Department department, CancellationToken ct = default);
}
