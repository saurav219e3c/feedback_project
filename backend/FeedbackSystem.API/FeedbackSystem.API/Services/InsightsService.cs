using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Repositories;

namespace FeedbackSystem.API.Services
{
    public class InsightsService : IInsightsService
    {
        private readonly IUserRepository _userRepo;
        private readonly IFeedbackRepository _feedbackRepo;
        private readonly IRecognitionRepository _recognitionRepo;

        public InsightsService(IUserRepository userRepo, IFeedbackRepository feedbackRepo, IRecognitionRepository recognitionRepo)
        {
            _userRepo = userRepo;
            _feedbackRepo = feedbackRepo;
            _recognitionRepo = recognitionRepo;
        }

        public async Task<PagedResult<FeedbackItemDto>> GetFeedbackGivenAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, int? categoryId, string? search, int page, int pageSize, CancellationToken ct)
        {
            await EnsureUserExists(userId, ct);
            var managerDeptId = isAdmin ? (int?)null : await GetDepartmentId(requesterUserId, ct);
            if (!isAdmin) await EnsureManagerCanSeeUser(managerDeptId, userId, ct);

            NormalizePaging(ref page, ref pageSize);
            var (items, total) = await _feedbackRepo.GetGivenAsync(userId, from, to, categoryId, search, page, pageSize, ct);
            return new PagedResult<FeedbackItemDto>(page, pageSize, total, items);
        }

        public async Task<PagedResult<FeedbackItemDto>> GetFeedbackReceivedAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, int? categoryId, string? search, int page, int pageSize, CancellationToken ct)
        {
            await EnsureUserExists(userId, ct);
            var managerDeptId = isAdmin ? (int?)null : await GetDepartmentId(requesterUserId, ct);
            if (!isAdmin) await EnsureManagerCanSeeUser(managerDeptId, userId, ct);

            NormalizePaging(ref page, ref pageSize);
            var (items, total) = await _feedbackRepo.GetReceivedAsync(userId, from, to, categoryId, search, page, pageSize, ct);
            return new PagedResult<FeedbackItemDto>(page, pageSize, total, items);
        }

        public async Task<PagedResult<RecognitionItemDto>> GetRecognitionsGivenAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct)
        {
            await EnsureUserExists(userId, ct);
            var managerDeptId = isAdmin ? (int?)null : await GetDepartmentId(requesterUserId, ct);
            if (!isAdmin) await EnsureManagerCanSeeUser(managerDeptId, userId, ct);

            NormalizePaging(ref page, ref pageSize);
            var (items, total) = await _recognitionRepo.GetGivenAsync(userId, from, to, search, page, pageSize, ct);
            return new PagedResult<RecognitionItemDto>(page, pageSize, total, items);
        }

        public async Task<PagedResult<RecognitionItemDto>> GetRecognitionsReceivedAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct)
        {
            await EnsureUserExists(userId, ct);
            var managerDeptId = isAdmin ? (int?)null : await GetDepartmentId(requesterUserId, ct);
            if (!isAdmin) await EnsureManagerCanSeeUser(managerDeptId, userId, ct);

            NormalizePaging(ref page, ref pageSize);
            var (items, total) = await _recognitionRepo.GetReceivedAsync(userId, from, to, search, page, pageSize, ct);
            return new PagedResult<RecognitionItemDto>(page, pageSize, total, items);
        }

        public async Task<UserInsightSummaryDto> GetSummaryAsync(
            int requesterUserId, bool isAdmin, int userId, CancellationToken ct)
        {
            await EnsureUserExists(userId, ct);
            var managerDeptId = isAdmin ? (int?)null : await GetDepartmentId(requesterUserId, ct);
            if (!isAdmin) await EnsureManagerCanSeeUser(managerDeptId, userId, ct);

            var fbTask = _feedbackRepo.GetSummaryAsync(userId, ct);
            var rcTask = _recognitionRepo.GetSummaryAsync(userId, ct);
            await Task.WhenAll(fbTask, rcTask);

            var fb = fbTask.Result;
            var rc = rcTask.Result;

            return new UserInsightSummaryDto(
                userId,
                fb.Given, fb.Received,
                rc.Given, rc.Received,
                fb.LatestGivenAt, fb.LatestReceivedAt,
                rc.LatestGivenAt, rc.LatestReceivedAt
            );
        }

        public async Task<PagedResult<FeedbackItemDto>> GetAllFeedbackAsync(
            int requesterUserId, bool isAdmin, FeedbackAllFilter filter, CancellationToken ct)
        {
            NormalizePaging(ref filter);

            int? deptScope = null;
            if (!isAdmin)
                deptScope = await GetDepartmentId(requesterUserId, ct);

            var (items, total) = await _feedbackRepo.GetAllAsync(
                filter.From, filter.To, filter.CategoryId, filter.Search, deptScope,
                filter.FromUserId, filter.ToUserId, filter.Page, filter.PageSize, ct);

            return new PagedResult<FeedbackItemDto>(filter.Page, filter.PageSize, total, items);
        }

        public async Task<PagedResult<RecognitionItemDto>> GetAllRecognitionsAsync(
            int requesterUserId, bool isAdmin, RecognitionAllFilter filter, CancellationToken ct)
        {
            NormalizePaging(ref filter);

            int? deptScope = null;
            if (!isAdmin)
                deptScope = await GetDepartmentId(requesterUserId, ct);

            var (items, total) = await _recognitionRepo.GetAllAsync(
                filter.From, filter.To, filter.Search, deptScope,
                filter.FromUserId, filter.ToUserId, filter.Page, filter.PageSize, ct);

            return new PagedResult<RecognitionItemDto>(filter.Page, filter.PageSize, total, items);
        }

        // ✅ Count-only across users
        public async Task<CountResultDto> GetAllFeedbackCountAsync(
            int requesterUserId, bool isAdmin, FeedbackAllFilter filter, CancellationToken ct)
        {
            int? deptScope = null;
            if (!isAdmin)
                deptScope = await GetDepartmentId(requesterUserId, ct);

            var total = await _feedbackRepo.CountAllAsync(
                filter.From, filter.To, filter.CategoryId, filter.Search, deptScope,
                filter.FromUserId, filter.ToUserId, ct);

            return new CountResultDto(total);
        }

        public async Task<CountResultDto> GetAllRecognitionsCountAsync(
            int requesterUserId, bool isAdmin, RecognitionAllFilter filter, CancellationToken ct)
        {
            int? deptScope = null;
            if (!isAdmin)
                deptScope = await GetDepartmentId(requesterUserId, ct);

            var total = await _recognitionRepo.CountAllAsync(
                filter.From, filter.To, filter.Search, deptScope,
                filter.FromUserId, filter.ToUserId, ct);

            return new CountResultDto(total);
        }

        // ✅ Category-based statistics
        public async Task<IReadOnlyList<CategoryStatsDto>> GetFeedbackByCategoryAsync(
            int requesterUserId, bool isAdmin, CategoryStatsFilter filter, CancellationToken ct)
        {
            int? deptScope = null;
            if (!isAdmin)
                deptScope = await _userRepo.GetDepartmentIdAsync(requesterUserId, ct);

            var targetDept = filter.DepartmentId ?? deptScope;
            return await _feedbackRepo.GetByCategoryAsync(filter.From, filter.To, targetDept, filter.UserId, ct);
        }

        public async Task<IReadOnlyList<RecognitionCategoryStatsDto>> GetRecognitionsByCategoryAsync(
            int requesterUserId, bool isAdmin, CategoryStatsFilter filter, CancellationToken ct)
        {
            int? deptScope = null;
            if (!isAdmin)
                deptScope = await _userRepo.GetDepartmentIdAsync(requesterUserId, ct);

            var targetDept = filter.DepartmentId ?? deptScope;
            return await _recognitionRepo.GetByCategoryAsync(filter.From, filter.To, targetDept, filter.UserId, ct);
        }

        // ✅ Parameterless by-category (all data, no filters)
        public async Task<IReadOnlyList<CategoryStatsDto>> GetFeedbackByCategoryAsync(CancellationToken ct)
        {
            return await _feedbackRepo.GetByCategoryAsync(null, null, null, null, ct);
        }

        public async Task<IReadOnlyList<RecognitionCategoryStatsDto>> GetRecognitionsByCategoryAsync(CancellationToken ct)
        {
            return await _recognitionRepo.GetByCategoryAsync(null, null, null, null, ct);
        }

        // -------------- helpers --------------
        private async Task EnsureUserExists(int userId, CancellationToken ct)
        {
            var exists = await _userRepo.UserExistsAsync(userId, ct);
            if (!exists) throw new KeyNotFoundException($"User {userId} not found.");
        }

        private async Task<int> GetDepartmentId(int userId, CancellationToken ct)
        {
            return await _userRepo.GetDepartmentIdAsync(userId, ct);
        }

        private async Task EnsureManagerCanSeeUser(int? managerDeptId, int targetUserId, CancellationToken ct)
        {
            if (!managerDeptId.HasValue) throw new UnauthorizedAccessException("Manager department scope missing.");
            var userDepId = await _userRepo.GetDepartmentIdAsync(targetUserId, ct);

            if (userDepId == 0 || userDepId != managerDeptId.Value)
                throw new UnauthorizedAccessException("You are not allowed to view this user's data.");
        }

        private static void NormalizePaging(ref int page, ref int pageSize)
        {
            page = page < 1 ? 1 : page;
            if (pageSize < 1 || pageSize > 200) pageSize = 20;
        }

        private static void NormalizePaging(ref FeedbackAllFilter f)
        {
            var p = f.Page; var s = f.PageSize;
            NormalizePaging(ref p, ref s);
            f = f with { Page = p, PageSize = s };
        }

        private static void NormalizePaging(ref RecognitionAllFilter f)
        {
            var p = f.Page; var s = f.PageSize;
            NormalizePaging(ref p, ref s);
            f = f with { Page = p, PageSize = s };
        }
    }
}