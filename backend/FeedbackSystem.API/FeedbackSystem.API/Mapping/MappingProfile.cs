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

    //submit fb => entity
    CreateMap<MyFeedbackSubmitDto, Feedback>()
        .ForMember(dest => dest.IsAnonymous, opt => opt.MapFrom(src => src.IsAnonymous ?? false))
        .ForMember(dest => dest.FromUserId, opt => opt.Ignore()) // we are authiticated user in service 
        .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

    // entity => show fb for employee
    CreateMap<Feedback, MyFeedbackDto>()
         .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : string.Empty))
         .ForMember(dest => dest.FromUserName, opt => opt.MapFrom(src => src.FromUser != null ? src.FromUser.FullName : string.Empty));


    // submit reco to entity 
    CreateMap<MyRecognitionSubmitDto, Recognition>()
        .ForMember(dest => dest.RecognitionId, opt => opt.Ignore())
        .ForMember(dest => dest.FromUserId, opt => opt.Ignore())
        .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
        //.ForMember(dest => dest.FromUser, opt => opt.Ignore())
        //.ForMember(dest => dest.ToUser, opt => opt.Ignore())
        //.ForMember(dest => dest.Badge, opt => opt.Ignore());

    //entity to show reco
    CreateMap<Recognition, MyAllRecognitionItemDto>()
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
