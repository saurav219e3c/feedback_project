using AutoMapper;
using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Mapping;

public class MappingProfile : Profile
{
  public MappingProfile()
  {
    CreateMap<Category, CategoryReadDto>()
        .ForSourceMember(s => s.Feedbacks, opt => opt.DoNotValidate());
   // CreateMap<Feedback, MyFeedbackSubmitDto>().ReverseMap();

    CreateMap<MyFeedbackSubmitDto, Feedback>()
        // Tell it how to handle the nullable boolean
        .ForMember(dest => dest.IsAnonymous, opt => opt.MapFrom(src => src.IsAnonymous ?? false))
        // Ignore these fields because the DTO doesn't have them (we set them manually)
        .ForMember(dest => dest.FromUserId, opt => opt.Ignore())
        .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

    CreateMap<Feedback, MyFeedbackDto>()
                .ForMember(dest => dest.CategoryName,
                           opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : string.Empty))
                .ForMember(dest => dest.FromUserName,
                       opt => opt.MapFrom(src => src.FromUser != null ? src.FromUser.FullName : string.Empty));

    // Ignore fields that will be set manually in the service
    CreateMap<MyRecognitionsubmitDto, Recognition>()
        .ForMember(dest => dest.RecognitionId, opt => opt.Ignore())
        .ForMember(dest => dest.FromUserId, opt => opt.Ignore())
        .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
        .ForMember(dest => dest.FromUser, opt => opt.Ignore())
        .ForMember(dest => dest.ToUser, opt => opt.Ignore())
        .ForMember(dest => dest.Badge, opt => opt.Ignore());

    // Maps the C# Entity to the Angular Response DTO
    CreateMap<Recognition, MyAllRecognitionItemDto>()
        // Since we used .Include() in the repository, AutoMapper can extract the names here:
        .ForMember(dest => dest.FromUserName, opt => opt.MapFrom(src => src.FromUser.FullName))
        .ForMember(dest => dest.ToUserName, opt => opt.MapFrom(src => src.ToUser.FullName))
        .ForMember(dest => dest.BadgeName, opt => opt.MapFrom(src => src.Badge.BadgeName));


    CreateMap<CategoryCreateDto, Category>()
              .ForMember(d => d.CategoryId, m => m.Ignore())
              .ForMember(d => d.IsActive, m => m.Ignore())
              .ForMember(d => d.CreatedAt, m => m.Ignore())
              .ForMember(d => d.Feedbacks, m => m.Ignore());

    CreateMap<CategoryUpdateDto, Category>()
        .ForMember(d => d.CategoryId, m => m.Ignore())
        .ForMember(d => d.CreatedAt, m => m.Ignore())
        .ForMember(d => d.Feedbacks, m => m.Ignore());


    CreateMap<User, UserReadDto>()
        .ForMember(d => d.Role, m => m.MapFrom(s => s.Role.RoleName))
        .ForSourceMember(s => s.Role, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.FeedbacksFrom, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.FeedbacksTo, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.ReviewsDone, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.RecognitionsFrom, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.RecognitionsTo, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.Notifications, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.ActivityLogs, opt => opt.DoNotValidate());

    CreateMap<User, AuthUserDto>()
        .ForMember(d => d.Role, m => m.MapFrom(s => s.Role.RoleName))
        .ForSourceMember(s => s.Role, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.FeedbacksFrom, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.FeedbacksTo, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.ReviewsDone, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.RecognitionsFrom, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.RecognitionsTo, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.Notifications, opt => opt.DoNotValidate())
        .ForSourceMember(s => s.ActivityLogs, opt => opt.DoNotValidate());

    CreateMap<UserCreateDto, User>()
        .ForMember(d => d.UserId, m => m.Ignore())
        .ForMember(d => d.RoleId, m => m.Ignore())
        .ForMember(d => d.PasswordHash, m => m.Ignore())
        .ForMember(d => d.IsActive, m => m.Ignore())
        .ForMember(d => d.CreatedAt, m => m.Ignore())
        .ForMember(d => d.Role, m => m.Ignore())
        .ForMember(d => d.FeedbacksFrom, m => m.Ignore())
        .ForMember(d => d.FeedbacksTo, m => m.Ignore())
        .ForMember(d => d.ReviewsDone, m => m.Ignore())
        .ForMember(d => d.RecognitionsFrom, m => m.Ignore())
        .ForMember(d => d.RecognitionsTo, m => m.Ignore())
        .ForMember(d => d.Notifications, m => m.Ignore())
        .ForMember(d => d.ActivityLogs, m => m.Ignore());

    CreateMap<UserUpdateDto, User>()
        .ForMember(d => d.UserId, m => m.Ignore())
        .ForMember(d => d.Email, m => m.Ignore())
        .ForMember(d => d.RoleId, m => m.Ignore())
        .ForMember(d => d.PasswordHash, m => m.Ignore())
        .ForMember(d => d.CreatedAt, m => m.Ignore())
        .ForMember(d => d.Role, m => m.Ignore())
        .ForMember(d => d.FeedbacksFrom, m => m.Ignore())
        .ForMember(d => d.FeedbacksTo, m => m.Ignore())
        .ForMember(d => d.ReviewsDone, m => m.Ignore())
        .ForMember(d => d.RecognitionsFrom, m => m.Ignore())
        .ForMember(d => d.RecognitionsTo, m => m.Ignore())
        .ForMember(d => d.Notifications, m => m.Ignore())
        .ForMember(d => d.ActivityLogs, m => m.Ignore());
  }
}
