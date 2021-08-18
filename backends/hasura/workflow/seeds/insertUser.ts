import faker from 'faker'

export function createUserInsertInput() {
  return {
    uid: faker.datatype.uuid(),
    name: faker.name.firstName(),
    roles: {
      data: [
        {
          role: 'USER',
        },
      ],
    },
    identities: { data: [] as Record<string, unknown>[] },
    task_groups: { data: [] as Record<string, unknown>[] },
  }
}

export function createIdentityInsertInput(
  idp?: string,
  props?: Record<string, unknown>,
): Record<string, unknown> {
  // eslint-disable-next-line no-param-reassign
  idp =
    idp ||
    (() => {
      const idps = ['FACEBOOK', 'GOOGLE', 'KAKAO', 'NAVER']
      return idps[faker.datatype.number() % idps.length]
    })()

  // eslint-disable-next-line no-param-reassign
  props =
    props ||
    (() => {
      const firstName = faker.name.firstName()
      const lastName = faker.name.lastName()
      if (idp === 'FACEBOOK') {
        return {
          id: faker.datatype.number().toString(),
          email: faker.internet.email(),
          name: `${firstName} ${lastName}`,
          name_format: '{last}{first}',
          first_name: firstName,
          last_name: lastName,
          short_name: firstName,
          picture: {
            data: {
              width: 50,
              height: 50,
              is_silhouette: true,
              url: 'https://scontent-ssn1-1.xx.fbcdn.net/v/t1.30497-1/cp0/c15.0.50.50a/p50x50/84628273_176159830277856_972693363922829312_n.jpg?_nc_cat=1&ccb=1-3&_nc_sid=12b3be&_nc_ohc=gzQVa5-RtlIAX8zb6oI&_nc_ht=scontent-ssn1-1.xx&tp=27&oh=d5ff24bb990d729686166686a568277d&oe=606E8638',
            },
          },
        }
      }
      if (idp === 'GOOGLE') {
        return {
          id: faker.datatype.number().toString(),
          email: faker.internet.email(),
          verified_email: true,
          name: `${firstName} ${lastName}`,
          given_name: firstName,
          family_name: lastName,
          picture:
            'https://lh6.googleusercontent.com/-mCUOAnsgiU0/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuck5UowYbScR1QxBsORIQIFohQHTxg/s96-c/photo.jpg',
          locale: 'ko',
        }
      }
      if (idp === 'KAKAO') {
        return {
          id: faker.datatype.number().toString(),
          connected_at: faker.date
            .between('2020-01-01T00:00:00Z', '2021-01-01T00:00:00Z')
            .toISOString(), // Datetime (RFC3339 internet date/time format) e.g. '2021-03-10T06:41:45Z'
          kakao_account: {
            profile_needs_agreement: false,
            profile: {
              nickname: `${firstName} ${lastName}`,
              thumbnail_image_url:
                'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
              profile_image_url:
                'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
            },
            has_email: true,
            email_needs_agreement: false,
            is_email_valid: true,
            is_email_verified: true,
            email: faker.internet.email(),
          },
        }
      }
      if (idp === 'NAVER') {
        return {
          id: faker.datatype.number().toString(),
          profile_image:
            'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
          email: faker.internet.email(),
          name: `${firstName} ${lastName}`,
        }
      }
    })()

  return {
    uid: faker.datatype.uuid(),
    idp,
    idp_id: props?.id,
    props,
  }
}
